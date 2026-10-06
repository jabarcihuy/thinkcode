"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDataset } from "@/features/database/data/datasets";
import { SqliteBrowserRunner, type SqliteRunResult } from "@/features/database/browser/sqlite-browser-runner";
import type { SqliteRow } from "@/features/database/domain/sql-query";
import { validateAssessmentQuery, type SqlAssessmentConfig } from "../validation/sql-assessment";

function ResultTable({ rows, columns, caption }: { rows: readonly SqliteRow[]; columns: string[]; caption: string }) {
  return <div role="region" aria-label={caption} tabIndex={0} className="max-w-full overflow-x-auto focus-visible:outline-2 focus-visible:outline-ring">
    <table className="w-full border-collapse text-left text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead><tr className="border-b border-border">{columns.map((column) => <th key={column} scope="col" className="whitespace-nowrap px-3 py-3 font-medium">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index} className="border-b border-border last:border-0">{columns.map((column) => <td key={column} className="whitespace-nowrap px-3 py-3 font-mono text-sm tabular-nums">{String(row[column] ?? "NULL")}</td>)}</tr>)}</tbody>
    </table>
    {rows.length === 0 && <p className="p-3 text-sm text-muted-foreground">Tidak ada record.</p>}
  </div>;
}
export function AssessmentSqlQuestion({ config, value, onChange, disabled = false }: {
  config: SqlAssessmentConfig; value: string; onChange: (value: string) => void; disabled?: boolean;
}) {
  const dataset = getDataset(config.datasetId);
  const [tableName, setTableName] = useState(config.table ?? dataset.tables[0]!.name);
  const table = dataset.tables.find((table) => table.name === tableName)!;
  const runner = useRef<SqliteBrowserRunner | null>(null);
  const alive = useRef(true);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SqliteRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; runner.current?.dispose(); };
  }, []);
  async function run(confirm = false) {
    if (pending || disabled) return;
    setPending(true); setError(null);
    try {
      let next: SqliteRunResult;
      if (confirm && result?.type === "mutation-preview" && runner.current) next = await runner.current.confirmMutation(result.previewId);
      else {
        validateAssessmentQuery(value, config);
        runner.current?.dispose(); runner.current = new SqliteBrowserRunner(config.datasetId);
        setResult(null); next = await runner.current.run(value);
      }
      if (alive.current) setResult(next);
    } catch (cause) { if (alive.current) setError(cause instanceof Error ? cause.message : "Query belum dapat dijalankan. Coba lagi."); }
    finally { if (alive.current) setPending(false); }
  }
  function edit(query: string) {
    runner.current?.dispose(); runner.current = null;
    setResult(null); setError(null); onChange(query);
  }
  const mutation = result?.type === "mutation-preview" || result?.type === "mutation-result" ? result : null;
  return <div className="mt-6 min-w-0 space-y-6">
    <section aria-labelledby="assessment-data-title" className="min-w-0 border-y border-border py-4">
      <h3 id="assessment-data-title" className="text-base font-semibold">Data soal · {dataset.title}</h3>
      <div role="group" aria-label="Pilih tabel data soal" className="my-3 flex flex-wrap gap-2">
        {dataset.tables.map((table) => <Button key={table.name} type="button" size="sm" variant={table.name === tableName ? "default" : "outline"} className="min-h-11" aria-pressed={table.name === tableName} onClick={() => setTableName(table.name)}>{table.name}</Button>)}
      </div>
      <p className="mb-3 text-sm leading-6 text-muted-foreground">{table.columns.map((column) => `${column.name}${column.key ? ` (${column.key})` : ""}`).join(" · ")}</p>
      <ResultTable rows={table.rows} columns={table.columns.map((column) => column.name)} caption={`Data awal ${table.name}`} />
    </section>
    <section aria-labelledby="assessment-query-title">
      <h3 id="assessment-query-title" className="text-base font-semibold">Tulis query SQL</h3>
      <label htmlFor="assessment-sql" className="sr-only">Jawaban SQL</label>
      <textarea id="assessment-sql" value={value} onChange={(event) => edit(event.target.value)} disabled={pending || disabled} spellCheck={false} autoCapitalize="off" autoCorrect="off" maxLength={4096} rows={7} className="mt-3 w-full resize-y rounded-md border border-input bg-background p-4 font-mono text-base leading-7 focus-visible:outline-2 focus-visible:outline-ring" />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" disabled={pending || disabled || !value.trim()} onClick={() => void run()}><Play size={16} aria-hidden="true" />{pending ? "Menjalankan query…" : "Coba query"}</Button>
        <p className="text-sm leading-6 text-muted-foreground">Setiap percobaan memakai data awal. Nilai dihitung saat tes dikirim.</p>
      </div>
    </section>
    <section aria-labelledby="assessment-output-title" aria-busy={pending} className="min-w-0 border-t border-border pt-5">
      <h3 id="assessment-output-title" className="mb-3 text-base font-semibold">Output</h3>
      {error && <p role="alert" className="mb-3 text-sm leading-6 text-destructive">{error}</p>}
      {pending ? <p role="status" className="text-sm text-muted-foreground">Memeriksa query pada data awal…</p>
        : result?.type === "query" ? <ResultTable rows={result.rows} columns={result.columns} caption="Hasil percobaan query" />
          : !mutation ? <p className="text-sm text-muted-foreground">Coba query untuk melihat hasilnya.</p> : <div className="space-y-4">
            <p role="status" className="text-sm">{mutation.type === "mutation-preview" ? "Pratinjau perubahan" : "Perubahan diterapkan"} · {mutation.affectedRows} record</p>
            {mutation.beforeRows.length > 0 && <div><h4 className="mb-2 text-sm font-medium">Sebelum</h4><ResultTable rows={mutation.beforeRows} columns={Object.keys(mutation.beforeRows[0]!)} caption="Record sebelum perubahan" /></div>}
            {mutation.afterRows.length > 0 && <div><h4 className="mb-2 text-sm font-medium">Sesudah</h4><ResultTable rows={mutation.afterRows} columns={Object.keys(mutation.afterRows[0]!)} caption="Record setelah perubahan" /></div>}
            {mutation.action === "DELETE" && mutation.type === "mutation-result" && <p className="text-sm text-muted-foreground">Record target sudah dihapus dari data percobaan.</p>}
            {mutation.type === "mutation-preview" && <Button type="button" disabled={pending || disabled} onClick={() => void run(true)}>Terapkan pada data percobaan</Button>}
          </div>}
    </section>
  </div>;
}
