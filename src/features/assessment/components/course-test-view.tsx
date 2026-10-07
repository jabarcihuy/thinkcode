import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DEFAULT_LEARNING_PATH_SLUG, learningPathHref } from "@/features/learning/config";
import { guestHref } from "@/features/guest/domain/links";
import type { LearningOverview } from "@/features/learning/types";
export function CourseTestView({ diagnostic, overview, title, result, resultHref, baselineScore, available, active, studied, startAction, guest = false }: {
 diagnostic: boolean; overview: LearningOverview | null; title?: string; result?: { latestScore: number; highestScore: number; passed: boolean }; resultHref?: string; baselineScore?: number; available: boolean; active: boolean; studied: boolean; startAction: React.ReactNode; guest?: boolean;
}) {
 const href = (value: string) => guest ? guestHref(value) : value;
  return <main id="main-content" className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
    <nav aria-label="Pilihan tes" className="mb-8 flex gap-5 border-b border-border">
      <Link href={href("/pre-test")} aria-current={diagnostic ? "page" : undefined} className={`inline-flex min-h-12 items-center border-b-2 text-sm font-semibold ${diagnostic ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Pre-test</Link>
      <Link href={href("/post-test")} aria-current={!diagnostic ? "page" : undefined} className={`inline-flex min-h-12 items-center border-b-2 text-sm font-semibold ${!diagnostic ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Post-test</Link>
    </nav>
    <h1 className="text-3xl font-semibold tracking-tight">{diagnostic ? "Kenali pemahaman awalmu" : "Uji pemahaman basis data"}</h1>
    <p className="mt-4 max-w-[65ch] leading-7 text-muted-foreground">{diagnostic ? "Sepuluh pertanyaan tentang relasi, membaca, dan mengubah data. Jawab sesuai yang kamu tahu; belum tahu juga boleh." : "Soal konsep dan tugas menulis SQL setelah belajar. Query diuji ulang di server; batas lulus 75/100."}</p>
    {diagnostic && studied && !result && <p role="note" className="mt-5 rounded-md bg-secondary p-4 text-sm leading-6">Kamu sudah mulai belajar. Hasil ini mencatat pemahaman saat ini, bukan kemampuan sebelum membaca materi.</p>}
    <section className="mt-8 border-y border-border py-6" aria-label="Status tes">
      {!title ? <p className="text-sm text-muted-foreground">Tes sedang disiapkan. Coba kembali nanti.</p> : <>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{diagnostic ? "Tidak ada syarat lulus dan tidak memengaruhi nilai akhir. Wajib diselesaikan sekali sebelum mulai materi." : "Terbuka setelah seluruh materi dan latihan inti tuntas. Kamu dapat mencoba lagi setelah sesi sebelumnya selesai."}</p>
        {result && <p className="mt-4 text-sm tabular-nums">{diagnostic ? `Pemahaman tercatat: ${result.latestScore}/100` : `Terbaru ${result.latestScore}/100 · Tertinggi ${result.highestScore}/100 · ${result.passed ? "Lulus" : "Belum lulus"}`}</p>}
        {resultHref && <Link className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline" href={resultHref}>Lihat hasil dan ringkasan topik</Link>}
        {startAction}
        {!available && !result && !active && <p className="mt-4 text-sm text-muted-foreground">Selesaikan {overview ? overview.metrics.totalRequiredLessons - overview.metrics.completedRequiredLessons : "semua"} materi beserta latihan inti yang tersisa terlebih dahulu.</p>}
      </>}
    </section>
    {!diagnostic && baselineScore !== undefined && <p className="mt-6 text-sm leading-6 text-muted-foreground">Catatan pre-test: {baselineScore}/100. Kedua tes memakai kasus berbeda; selisih skor bukan bukti tunggal keberhasilan belajar.</p>}
    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
      <Button asChild variant="outline"><Link href={href(learningPathHref(DEFAULT_LEARNING_PATH_SLUG))}>{diagnostic ? "Buka materi" : "Tinjau materi"}</Link></Button>
      {!diagnostic && <Button asChild variant="outline"><Link href={href("/lab")}>Berlatih di Lab Materi</Link></Button>}
    </div>
    <p className="mt-6 text-sm leading-6 text-muted-foreground">AI dan petunjuk dijeda selama tes berlangsung.</p>
  </main>;
}
