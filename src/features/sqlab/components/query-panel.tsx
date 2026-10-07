"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { runSqlab, type SqlabResult } from "../browser/runner";
import { querySchema } from "../domain/query";
import type { SqlabDocument } from "../domain/document";
export function QueryPanel({
  document: doc,
  save,
  busy,
  setBusy,
}: {
  document: SqlabDocument;
  save: (doc: SqlabDocument) => string | null;
  busy: boolean;
  setBusy: (value: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SqlabResult | null>(null);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const sql =
    query ||
    (doc.schema.tables[0]?.columns.length
      ? `SELECT * FROM "${doc.schema.tables[0].name}";`
      : "");
  async function run() {
    setBusy(true);
    setError("");
    setConfirm(false);
    setResult(null);
    controller.current = new AbortController();
    try {
      const data = await runSqlab(doc, sql, controller.current.signal);
      const failure = save(data.document);
      if (failure) throw new Error(failure);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Query belum berhasil.");
    } finally {
      setBusy(false);
    }
  }
  function requestRun() {
    const parsed = querySchema.safeParse(sql);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Periksa query.");
      return;
    }
    if (/^\s*(INSERT|UPDATE|DELETE)\b/i.test(sql)) setConfirm(true);
    else void run();
  }
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Query database kamu</h2>
      <Label htmlFor="sqlab-query">SQL</Label>
      <textarea
        id="sqlab-query"
        spellCheck={false}
        value={sql}
        onChange={(e) => {
          setQuery(e.target.value);
          setConfirm(false);
        }}
        maxLength={4096}
        rows={7}
        className="w-full rounded-lg border border-border bg-secondary/30 p-4 font-mono text-base leading-7 focus-visible:outline-2 focus-visible:outline-ring"
      />
      <p className="text-xs leading-5 text-muted-foreground">
        SELECT untuk membaca; INSERT, UPDATE, DELETE untuk mengubah data lokal.
        Skema dibuat di tab Skema.
      </p>
      <Button disabled={busy || !sql} onClick={requestRun}>
        {busy ? "Menjalankan…" : "Jalankan query"}
      </Button>
      {confirm && (
        <div
          role="group"
          aria-label="Konfirmasi perubahan"
          className="space-y-3 border-y border-border py-4"
        >
          <p className="text-sm">
            Query ini mengubah data SQLab. Tanpa WHERE, UPDATE/DELETE dapat
            mengubah seluruh tabel.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy} onClick={() => void run()}>
              Ya, jalankan perubahan
            </Button>
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              Batal
            </Button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {result && (
        <div aria-live="polite">
          <h3 className="text-lg font-semibold">Hasil query</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {result.columns.length
              ? `${result.rows.length} baris hasil`
              : `${result.changes} record berubah`}
          </p>
          {result.columns.length > 0 && (
            <div
              tabIndex={0}
              role="region"
              aria-label="Hasil query"
              className="mt-3 max-w-full overflow-auto rounded-lg border border-border"
            >
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    {result.columns.map((c) => (
                      <th
                        key={c}
                        className="whitespace-nowrap border-b p-3 font-mono"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r, i) => (
                    <tr key={i}>
                      {result.columns.map((c) => (
                        <td
                          key={c}
                          className="max-w-60 break-words border-b p-3"
                        >
                          {String(r[c] ?? "NULL")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
