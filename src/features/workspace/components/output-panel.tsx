import type { CodeRunResult } from "@/lib/providers/code-runner";

const labels: Record<CodeRunResult["status"], string> = {
  success: "Berhasil dijalankan",
  syntax_error: "Syntax Error",
  runtime_error: "Runtime Error",
  timeout: "Waktu eksekusi habis",
  internal_error: "Sandbox bermasalah",
};

export function OutputPanel({ result, error, pending }: { result: CodeRunResult | null; error: string | null; pending: boolean }) {
  return <section aria-label="Hasil eksekusi" aria-live="polite" className="min-h-48 rounded-lg border border-border bg-code-surface p-5 text-code-foreground">
    {pending ? <p className="text-sm">Kode sedang dijalankan…</p> : error ? <p className="text-sm">{error}</p> : result ? <>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3">
        <h3 className="text-sm font-semibold">{labels[result.status]}</h3>
        {result.executionTimeMs !== null && <span className="text-xs opacity-75">{result.executionTimeMs} ms</span>}
      </div>
      {result.stderr && <div className="mt-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">Error</p><pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm">{result.stderr}</pre></div>}
      {result.stdout && <div className="mt-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">Output</p><pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm">{result.stdout}</pre></div>}
      {result.outputTruncated && <p className="mt-4 text-sm">Output dibatasi agar halaman tetap responsif.</p>}
      {!result.stdout && !result.stderr && <p className="mt-4 text-sm opacity-75">Program selesai tanpa menghasilkan output.</p>}
    </> : <p className="text-sm opacity-75">Jalankan kode untuk melihat hasilnya di sini.</p>}
  </section>;
}
