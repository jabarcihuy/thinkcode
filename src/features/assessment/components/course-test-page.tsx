import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAccount } from "@/lib/auth/session";
import { getAssessmentSummaries } from "../data/assessment-repository";
import { getLearningOverview } from "@/features/learning/data/learning-repository";
import { DEFAULT_LEARNING_PATH_SLUG, learningPathHref } from "@/features/learning/config";
import { StartAssessmentButton } from "./start-assessment-button";

export async function CourseTestPage({ diagnostic }: { diagnostic: boolean }) {
  const { userId } = await requireAccount();
  const [tests, overview] = await Promise.all([
    getAssessmentSummaries(DEFAULT_LEARNING_PATH_SLUG, userId),
    getLearningOverview(DEFAULT_LEARNING_PATH_SLUG, userId),
  ]);
  const test = tests.find((entry) => entry.type === (diagnostic ? "PRETEST" : "FINAL"));
  const baseline = tests.find((entry) => entry.type === "PRETEST");
  const studied = overview?.lessons.some((lesson) => lesson.state === "COMPLETED" || lesson.state === "IN_PROGRESS");
  return <main id="main-content" className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
    <nav aria-label="Pilihan tes" className="mb-8 flex gap-5 border-b border-border">
      <Link href="/pre-test" aria-current={diagnostic ? "page" : undefined} className={`inline-flex min-h-12 items-center border-b-2 text-sm font-semibold ${diagnostic ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Pre-test</Link>
      <Link href="/post-test" aria-current={!diagnostic ? "page" : undefined} className={`inline-flex min-h-12 items-center border-b-2 text-sm font-semibold ${!diagnostic ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Post-test</Link>
    </nav>
    <h1 className="text-3xl font-semibold tracking-tight">{diagnostic ? "Kenali pemahaman awalmu" : "Uji pemahaman basis data"}</h1>
    <p className="mt-4 max-w-[65ch] leading-7 text-muted-foreground">{diagnostic ? "Sepuluh pertanyaan tentang relasi, membaca, dan mengubah data. Jawab sesuai yang kamu tahu; belum tahu juga boleh." : "Sepuluh pertanyaan setelah belajar. Kerjakan mandiri; nilai dihitung di server dengan batas lulus 75/100."}</p>
    {diagnostic && studied && !test?.result && <p role="note" className="mt-5 rounded-md bg-secondary p-4 text-sm leading-6">Kamu sudah mulai belajar. Hasil ini mencatat pemahaman saat ini, bukan kemampuan sebelum membaca materi.</p>}
    <section className="mt-8 border-y border-border py-6" aria-label="Status tes">
      {!test ? <p className="text-sm text-muted-foreground">Tes sedang disiapkan. Kamu tetap dapat membaca materi.</p> : <>
        <h2 className="text-xl font-semibold">{test.title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{diagnostic ? "Tidak ada syarat lulus dan tidak memengaruhi nilai akhir. Satu hasil disimpan sebagai catatan awal." : "Terbuka setelah seluruh materi wajib selesai dibaca. Kamu dapat mencoba lagi setelah sesi sebelumnya selesai."}</p>
        {test.result && <p className="mt-4 text-sm tabular-nums">{diagnostic ? `Pemahaman tercatat: ${test.result.latestScore}/100` : `Terbaru ${test.result.latestScore}/100 · Tertinggi ${test.result.highestScore}/100 · ${test.result.passed ? "Lulus" : "Belum lulus"}`}</p>}
        {test.completedSessionId && <Link className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline" href={`/assessments/sessions/${test.completedSessionId}/result`}>Lihat hasil dan ringkasan topik</Link>}
        {(test.available || test.activeSessionId) && <StartAssessmentButton slug={test.slug} activeSessionId={test.activeSessionId} label={test.result ? "Ulangi post-test" : diagnostic ? "Mulai pre-test" : "Mulai post-test"} />}
        {!test.available && !test.result && !test.activeSessionId && <p className="mt-4 text-sm text-muted-foreground">Selesaikan {overview ? overview.metrics.totalRequiredLessons - overview.metrics.completedRequiredLessons : "semua"} materi yang tersisa terlebih dahulu.</p>}
      </>}
    </section>
    {!diagnostic && baseline?.result && <p className="mt-6 text-sm leading-6 text-muted-foreground">Catatan pre-test: {baseline.result.latestScore}/100. Kedua tes memakai kasus berbeda; selisih skor bukan bukti tunggal keberhasilan belajar.</p>}
    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
      <Button asChild variant="outline"><Link href={learningPathHref(DEFAULT_LEARNING_PATH_SLUG)}>{diagnostic ? "Buka materi" : "Tinjau materi"}</Link></Button>
      {!diagnostic && <Button asChild variant="outline"><Link href="/lab">Berlatih di Lab SQL</Link></Button>}
    </div>
    <p className="mt-6 text-sm leading-6 text-muted-foreground">AI dan petunjuk dijeda selama tes berlangsung.</p>
  </main>;
}
