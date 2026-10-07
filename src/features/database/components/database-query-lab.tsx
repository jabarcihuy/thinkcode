"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Play, RotateCcw, StepBack, StepForward } from "lucide-react";
import { DraftStatus } from "@/components/forms/draft-status";
import { useLocalDraft } from "@/lib/browser/use-local-draft";
import { readQueryDraft } from "../domain/query-draft";
import { Button } from "@/components/ui/button";
import { getDataset } from "../data/datasets";
import type { DatasetId } from "../data/dataset-types";
import { CampusDataExplorer } from "@/features/database/components/campus-data-explorer";
import {
  clampTraceStep,
  inspectSqlStatement,
  QUERY_TRACE_STEPS,
  SqlQueryValidationError,
  type SqliteRow,
} from "@/features/database/domain/sql-query";
import { SqliteBrowserRunner, SqliteRunnerError, type SqliteRunResult } from "@/features/database/browser/sqlite-browser-runner";
import { TutorPanel } from "@/features/ai/components/tutor-panel";

import { applyDatasetMutation, initialDatasetSnapshot } from "../domain/dataset-exploration";

type QueryRun = { type: "query"; rows: SqliteRow[]; columns: string[]; prediction: string; query: string };
type MutationRun = Exclude<SqliteRunResult, { type: "query" | "mutation-cancelled" }> & { prediction: string; query: string };
type LabRun = QueryRun | MutationRun;

function DataTable({ rows, columns, caption }: { rows: SqliteRow[]; columns: string[]; caption: string }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">Tidak ada record.</p>;
  return <div>
    <p className="mb-2 text-xs leading-5 text-muted-foreground sm:hidden">Geser tabel ke samping untuk melihat kolom lainnya.</p>
    <div role="region" aria-label={`${caption}. Geser ke samping bila semua kolom belum terlihat.`} tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring">
    <table className="w-full min-w-[20rem] border-collapse text-left text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead><tr className="border-b border-border text-muted-foreground">{columns.map((column) => <th scope="col" key={column} className="px-3 py-2 font-medium">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={`${JSON.stringify(row)}-${index}`} className="border-b border-border/70 last:border-0">{columns.map((column) => <td key={column} className="px-3 py-2 font-mono text-[0.82rem] tabular-nums">{String(row[column] ?? "NULL")}</td>)}</tr>)}</tbody>
    </table>
    </div>
  </div>;
}

function QueryResults({ run }: { run: LabRun | null }) {
  if (!run) return <p className="text-sm leading-6 text-muted-foreground">Jalankan query untuk melihat hasil atau perubahan data.</p>;
  if (run.type === "query") {
    if (run.rows.length === 0) return <p className="text-sm leading-6 text-muted-foreground">Query berhasil, tetapi tidak ada baris yang cocok.</p>;
    return <DataTable rows={run.rows} columns={run.columns} caption="Hasil query dari SQLite" />;
  }

  const previewing = run.type === "mutation-preview";
  const isInsert = run.action === "INSERT";
  const columns = [...new Set([...run.beforeRows, ...run.afterRows].flatMap((row) => Object.keys(row)))];
  return <div className="space-y-5">
    <p role="status" className="text-sm font-medium">{run.affectedRows === 0
      ? "Tidak ada record yang cocok. Data latihan tidak berubah."
      : previewing ? `Pratinjau: ${run.affectedRows} record akan ${isInsert ? "ditambahkan" : run.action === "UPDATE" ? "diubah" : "dihapus"}.`
        : `${run.affectedRows} record ${isInsert ? "ditambahkan" : run.action === "UPDATE" ? "diubah" : "dihapus"}.`}</p>
    {run.affectedRows > 0 && <div className="space-y-5">
      {!isInsert && <div className="min-w-0"><h4 className="mb-2 text-xs font-semibold text-muted-foreground">Sebelum</h4><DataTable rows={run.beforeRows} columns={columns} caption="Record sebelum perubahan" /></div>}
      {!isInsert && run.action !== "DELETE" && <div className="min-w-0"><h4 className="mb-2 text-xs font-semibold text-muted-foreground">Sesudah</h4><DataTable rows={run.afterRows} columns={columns} caption="Record setelah perubahan" /></div>}
      {isInsert && <div className="min-w-0"><h4 className="mb-2 text-xs font-semibold text-muted-foreground">{previewing ? "Record yang akan ditambahkan" : "Record yang ditambahkan"}</h4><DataTable rows={run.afterRows} columns={columns} caption="Record insert" /></div>}
      {run.action === "DELETE" && <p className="text-sm leading-6 text-muted-foreground">Record tersebut tidak ada lagi setelah perubahan diterapkan.</p>}
    </div>}
    <p className="text-xs text-muted-foreground">Tabel latihan: <code className="font-mono text-foreground">{run.table}</code>. Perubahan hanya berlaku di sesi ini.</p>
  </div>;
}

function formatRun(run: LabRun): string {
  if (run.type === "query") {
    return [run.columns.join(" | "), ...run.rows.map((row) => run.columns.map((column) => String(row[column] ?? "NULL")).join(" | "))].join("\n").slice(0, 4_000);
  }
  return `${run.action} ${run.table}: ${run.affectedRows} row(s)\nBefore: ${JSON.stringify(run.beforeRows)}\nAfter: ${JSON.stringify(run.afterRows)}`.slice(0, 4_000);
}

export function DatabaseQueryLab({
  title = "Siapa yang masuk angkatan 2025?",
  prompt = "Prediksi hasilnya, ubah query, lalu jalankan pada data latihan.",
  starterSql: suppliedStarterSql,
  datasetId = "campus",
  lessonId, userId, compact = false,
}: {
  title?: string;
  prompt?: string;
  starterSql?: string;
  datasetId?: DatasetId;
  lessonId?: string;
  userId?: string;
  compact?: boolean;
}) {
  const dataset = getDataset(datasetId);
  const starterSql = suppliedStarterSql ?? dataset.starterSql;
  const [snapshot, setSnapshot] = useState(() => initialDatasetSnapshot(dataset));
  const initialDraft = useMemo(() => ({ queryText: starterSql, prediction: "" }), [starterSql]);
  const draft = useLocalDraft({ key: userId ? `quethink:query-draft:v1:${userId}:${lessonId ?? "playground"}:${datasetId}` : null, signature: starterSql, initial: initialDraft, parse: readQueryDraft });
  const { queryText, prediction } = draft.value;
  function setQueryText(queryText: string) { draft.save({ ...draft.value, queryText }); }
  function setPrediction(prediction: string) { draft.save({ ...draft.value, prediction }); }
  const [run, setRun] = useState<LabRun | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [visualStep, setVisualStep] = useState(0);
  const runnerRef = useRef<SqliteBrowserRunner | null>(null);

  useEffect(() => () => runnerRef.current?.dispose(), []);

  let currentStatement: ReturnType<typeof inspectSqlStatement> | null = null;
  try { currentStatement = inspectSqlStatement(queryText, dataset); } catch { /* Invalid text is reported when Run is pressed. */ }
  const isMutation = currentStatement?.kind === "mutation";
  const preview = run?.type === "mutation-preview" ? run : null;
  const currentStep = QUERY_TRACE_STEPS[visualStep];

  function resetData() {
    runnerRef.current?.dispose();
    runnerRef.current = null;
    setSnapshot(initialDatasetSnapshot(dataset));
    draft.clear();
    setRun(null);
    setQueryError(null);
    setVisualStep(0);
  }

  async function runQuery() {
    if (pending || !prediction.trim()) return;
    setPending(true);
    setQueryError(null);
    setRun(null);
    setVisualStep(1);
    try {
      runnerRef.current ??= new SqliteBrowserRunner(datasetId);
      const result = await runnerRef.current.run(queryText);
      if (result.type !== "mutation-cancelled") setRun({ ...result, prediction: prediction.trim(), query: queryText });
    } catch (error) {
      if (error instanceof SqliteRunnerError && (error.code === "timeout" || error.code === "startup")) setSnapshot(initialDatasetSnapshot(dataset));
      setQueryError(error instanceof SqlQueryValidationError || error instanceof SqliteRunnerError
        ? error.message
        : "Query belum berhasil dijalankan. Periksa browser lalu coba lagi.");
    } finally {
      setPending(false);
    }
  }

  async function confirmMutation() {
    if (!preview || pending || !runnerRef.current) return;
    setPending(true);
    setQueryError(null);
    try {
      const result = await runnerRef.current.confirmMutation(preview.previewId);
      if (result.type === "mutation-result") {
        setSnapshot((current) => applyDatasetMutation(dataset, current, result.table, result.tableRows));
        setRun({ ...result, prediction: preview.prediction, query: preview.query });
      }
    } catch (error) {
      if (error instanceof SqliteRunnerError && (error.code === "timeout" || error.code === "startup")) {
        setSnapshot(initialDatasetSnapshot(dataset));
        setRun(null);
      }
      setQueryError(error instanceof SqliteRunnerError ? error.message : "Perubahan tidak berhasil diterapkan. Periksa data lalu coba lagi.");
    } finally {
      setPending(false);
    }
  }

  async function cancelMutation() {
    if (!preview || pending) return;
    setPending(true);
    try {
      await runnerRef.current?.cancelMutation(preview.previewId);
      setRun(null);
    } catch (error) {
      setQueryError(error instanceof SqliteRunnerError ? error.message : "Pratinjau tidak dapat dibatalkan. Reset data latihan.");
    } finally {
      setPending(false);
    }
  }

  const traceCanRun = run?.type === "query";
  const resultCount = run?.type === "query" ? run.rows.length : run?.affectedRows;

  return <section id="database-lab" aria-label="Praktik query basis data" className={compact ? "scroll-mt-6 py-4" : "mt-10 scroll-mt-24 border-y border-border py-8"}>
    {!compact && <h2 className="text-2xl font-semibold tracking-tight">Praktik di lab</h2>}
    <div className={compact ? "space-y-6" : "mt-7 space-y-10"}>
      <section id="lab-tables" aria-labelledby="database-visual-title" className="min-w-0 scroll-mt-24">
        <div className="flex flex-wrap items-baseline justify-between gap-3"><h3 id="database-visual-title" className="text-lg font-semibold">Tabel dan relasi</h3>{resultCount !== undefined && <span className="text-xs text-muted-foreground">{resultCount} {run?.type === "query" ? "baris hasil" : "record terdampak"}</span>}</div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{run?.type === "mutation-preview" ? "Tinjau record sebelum menerapkan perubahan." : run?.type === "mutation-result" ? "Data tabel sudah diperbarui." : "Pilih tabel dan ikuti key sebelum mencoba query."}</p>
        <div className="mt-4"><CampusDataExplorer dataset={dataset} snapshot={snapshot} query={run?.query ?? queryText} step={run?.type === "query" ? visualStep : 1} /></div>
        <details className="mt-4">
          <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring">Alur baca query</summary>
          <p className="mb-3 text-sm leading-6 text-muted-foreground"><code className="text-foreground">{currentStep.clause}</code> · {currentStep.description}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1" aria-label="Alur baca konseptual">
            {QUERY_TRACE_STEPS.map((step, index) => <span key={step.clause} className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ${index === visualStep && traceCanRun ? "w-9 bg-foreground" : "w-4 bg-border"}`} aria-hidden="true" />)}
            <span className="ml-2 text-xs tabular-nums text-muted-foreground">{traceCanRun ? `${visualStep + 1} / ${QUERY_TRACE_STEPS.length}` : "Alur konseptual"}</span>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" aria-label="Langkah sebelumnya" disabled={!traceCanRun || visualStep === 0} onClick={() => setVisualStep((step) => clampTraceStep(step - 1))}><StepBack size={15} aria-hidden="true" />Sebelumnya</Button>
            <Button type="button" size="sm" variant="outline" aria-label="Langkah berikutnya" disabled={!traceCanRun || visualStep === QUERY_TRACE_STEPS.length - 1} onClick={() => setVisualStep((step) => clampTraceStep(step + 1))}>Berikutnya<StepForward size={15} aria-hidden="true" /></Button>
          </div>
        </div>
        </details>
        <p className="sr-only" aria-live="polite">{traceCanRun ? `Langkah ${visualStep + 1}: ${currentStep.title}. ${currentStep.description}` : "Diagram relasi tersedia untuk diperiksa."}</p>
      </section>

      <section id="lab-query" aria-labelledby="database-query-title" className="min-w-0 scroll-mt-24 border-t border-border pt-7">
        <div className="flex flex-wrap items-baseline justify-between gap-4"><h3 id="database-query-title" className="text-lg font-semibold">Tulis query</h3><span className="font-mono text-xs text-muted-foreground">SQLite · data latihan lokal</span></div>
        <p className="mt-2 max-w-[65ch] text-sm leading-6 text-muted-foreground"><span className="font-medium text-foreground">{title}</span> {prompt}</p>
        <label htmlFor="database-sql" className="sr-only">Query SQL pada data latihan</label>
        <textarea id="database-sql" value={queryText} onChange={(event) => { setQueryText(event.target.value); setRun(null); setQueryError(null); setVisualStep(0); }}
          onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); void runQuery(); } }}
          maxLength={4_096} spellCheck={false} autoCapitalize="off" autoCorrect="off" disabled={pending || draft.status === "loading" || Boolean(preview)} rows={compact ? 5 : 7}
          className="mt-3 min-h-40 w-full resize-y rounded-md border border-input bg-code-surface p-4 font-mono text-base leading-6 text-code-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70 sm:text-sm" />
        {userId && <div className="mt-3"><DraftStatus status={draft.status} restored={draft.restored} onRetry={() => draft.save(draft.value)} onReset={draft.clear} /><p className={`${compact ? "hidden" : ""} mt-1 text-xs leading-5 text-muted-foreground`}>Draf menyimpan query dan prediksi. Saat halaman dibuka ulang, data kembali ke kondisi awal; jalankan query untuk melihat hasil.</p></div>}
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{isMutation ? "Pratinjau sebelum menerapkan perubahan." : "SELECT membaca data tanpa mengubahnya."} Ctrl/⌘ + Enter untuk Run.</p>

        <label htmlFor="database-prediction" className="mt-6 block text-sm font-semibold">Sebelum Run, berapa {isMutation ? "record yang akan berubah" : "baris hasilnya"}?</label>
        <input id="database-prediction" type="number" min="0" max="100" step="1" value={prediction}
          onChange={(event) => setPrediction(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void runQuery(); } }}
          disabled={pending || draft.status === "loading" || Boolean(preview)} placeholder={isMutation ? "Contoh: 1" : "Contoh: 2"} aria-describedby="database-prediction-help"
          className="mt-2 min-h-11 w-full max-w-40 rounded-md border border-input bg-background px-3 py-2 font-mono text-base outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70 sm:text-sm" />
        <p id="database-prediction-help" className="mt-2 text-xs leading-5 text-muted-foreground">Hasil baru terlihat setelah kamu membuat prediksi.</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {!preview && <Button type="button" disabled={pending || draft.status === "loading" || !prediction.trim()} onClick={() => void runQuery()}><Play size={15} aria-hidden="true" />{pending ? "Menjalankan…" : isMutation ? "Pratinjau perubahan" : "Jalankan SELECT"}</Button>}
          {preview && <><Button type="button" disabled={pending} onClick={() => void confirmMutation()}>{pending ? "Menerapkan…" : "Terapkan perubahan"}</Button><Button type="button" variant="outline" disabled={pending} onClick={() => void cancelMutation()}>Batalkan</Button></>}
          <Button type="button" variant="outline" disabled={pending} onClick={resetData}><RotateCcw size={15} aria-hidden="true" />Reset data</Button>
        </div>
        {queryError && <p role="alert" className="mt-4 rounded-md border border-destructive/50 px-3 py-3 text-sm leading-6 text-destructive">{queryError}</p>}
      </section>

      <section id="lab-results" aria-labelledby="database-result-title" aria-busy={pending} className="min-w-0 scroll-mt-24 border-t border-border pt-7">
        <div className="flex flex-wrap items-baseline justify-between gap-3"><h3 id="database-result-title" className="text-lg font-semibold">Hasil query</h3>{resultCount !== undefined && <span className="text-xs text-muted-foreground">{resultCount} {run?.type === "query" ? "baris" : "record"}</span>}</div>
        {run && <div className="space-y-3 border-b border-border py-4">
          <div><p className="text-xs font-semibold text-muted-foreground">Prediksi</p><p className="mt-1 font-mono text-sm">{run.prediction} {run.type === "query" ? "baris" : "record"}</p></div>
          <div><p className="text-xs font-semibold text-muted-foreground">Hasil aktual</p><p className="mt-1 font-mono text-sm">{resultCount} {run.type === "query" ? "baris" : "record"}</p></div>
          <p role="status" aria-live="polite" className="text-sm">{Number(run.prediction) === resultCount ? "Prediksimu sesuai. Periksa kembali kolom atau record yang terlihat." : run.type === "query" ? "Prediksinya berbeda. Periksa kondisi WHERE atau relasi JOIN." : "Jumlahnya berbeda dari prediksi. Cermati target perubahan."}</p>
        </div>}
        {run?.type === "mutation-preview" && <p className="my-4 rounded-md border border-accent/40 p-3 text-sm leading-6">Belum ada data yang diubah. Tinjau pratinjau di bawah sebelum menerapkan.</p>}
        <div className="mt-4"><QueryResults run={run} /></div>
      </section>
    </div>

    {lessonId && <div id="lab-tutor" className="scroll-mt-6"><TutorPanel lessonId={lessonId} sourceCode={queryText} visibleOutput={run ? formatRun(run) : ""} /></div>}
    <p className="mt-8 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">Lab memakai data fiktif lokal pada SQLite. Query tidak terhubung ke Supabase atau data akun. Reset data memulai ulang sesi latihan.</p>
  </section>;
}
