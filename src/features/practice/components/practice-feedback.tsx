import type { GradeResult } from "@/features/practice/types";

export function PracticeFeedback({ result, error, pending }: { result: GradeResult | null; error: string | null; pending: boolean }) {
  return <div aria-live="polite" className="rounded-lg border border-border bg-muted p-5">
    {pending ? <p className="text-sm">Jawaban sedang diperiksa…</p> : error ? <p className="text-sm text-destructive">{error}</p> : result ? <>
      <p className="text-base font-semibold">{result.passed ? "Jawaban benar" : "Belum berhasil"}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{result.feedback}</p>
      <p className="mt-3 text-sm font-medium">Skor {result.score}/100</p>
      {result.visibleTests.length > 0 && <ol className="mt-5 space-y-3 border-t border-border pt-4">{result.visibleTests.map((test) => <li key={test.position} className="text-sm"><p className="font-semibold">Test terlihat {test.position}: {test.passed ? "Lulus" : "Belum lulus"}</p>{!test.passed && <><p className="mt-1 text-muted-foreground">Diharapkan: <code className="whitespace-pre-wrap">{test.expectedOutput}</code></p><p className="mt-1 text-muted-foreground">Hasil: <code className="whitespace-pre-wrap">{test.actualOutput || "(kosong)"}</code></p>{test.detail && <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-code-surface p-3 font-mono text-xs text-code-foreground">{test.detail}</pre>}</>}</li>)}</ol>}
      {result.hiddenTotal > 0 && <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">Test tersembunyi: {result.hiddenPassed}/{result.hiddenTotal} lulus. Detail input dan output tidak ditampilkan.</p>}
      {result.lessonCompleted && <p className="mt-4 text-sm font-semibold text-primary">Semua practice wajib selesai. Lesson berikutnya sekarang tersedia.</p>}
    </> : <p className="text-sm text-muted-foreground">Pilih Check Answer untuk memeriksa jawaban dan menyimpan percobaan.</p>}
  </div>;
}
