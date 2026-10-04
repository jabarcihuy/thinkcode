import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireAccount } from "@/lib/auth/session";
import { DEFAULT_LEARNING_PATH_SLUG, lessonHref, learningPathHref } from "@/features/learning/config";
import { ProgressSummary } from "@/features/learning/components/progress-summary";
import { getLearningOverview } from "@/features/learning/data/learning-repository";
import { getAssessmentSummaries } from "@/features/assessment/data/assessment-repository";

export const metadata: Metadata = { title: "Dashboard" };
export default async function DashboardPage() {
  const { userId, profile } = await requireAccount();
  const [overview, tests] = await Promise.all([getLearningOverview(DEFAULT_LEARNING_PATH_SLUG, userId), getAssessmentSummaries(DEFAULT_LEARNING_PATH_SLUG, userId)]);
  const pre = tests.find((test) => test.type === "PRETEST");
  const post = tests.find((test) => test.type === "FINAL");
  const current = overview?.metrics.currentLesson;
  const offerBaseline = Boolean(pre && !pre.result);
  const complete = Boolean(overview?.metrics.totalRequiredLessons && overview.metrics.percentage === 100 && post?.result?.passed);
  return <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
    <h1 className="text-3xl font-semibold tracking-tight">Selamat datang{profile.display_name ? `, ${profile.display_name}` : ""}.</h1>
    <p className="mt-3 leading-7 text-muted-foreground">Belajar basis data, dari memahami relasi hingga mencoba query.</p>
    {!overview ? <p className="mt-10 text-muted-foreground">Materi akan muncul setelah dipublikasikan.</p> : <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <section className="border-t border-border pt-7" aria-label="Langkah belajar berikutnya">
        <h2 className="text-2xl font-semibold">{complete ? "Jalur belajar selesai" : offerBaseline ? "Mulai dari pre-test" : current ? "Lanjutkan membaca" : "Siap untuk post-test"}</h2>
        <p className="mt-3 max-w-[65ch] leading-7 text-muted-foreground">{complete ? "Seluruh materi selesai dibaca dan post-test lulus. Materi dan Lab tetap bisa dibuka kembali." : offerBaseline ? "Kenali pemahaman awalmu melalui sepuluh pertanyaan. Skornya tidak menentukan kelulusan." : current ? `Materi ${overview.lessons.findIndex((lesson) => lesson.id === current.id) + 1}. ${current.title}` : "Uji pemahaman setelah membaca semua materi. Kamu bisa berlatih dahulu di Lab SQL."}</p>
        <Button asChild className="mt-6 w-full sm:w-auto"><Link href={complete ? "/post-test" : offerBaseline ? "/pre-test" : current ? lessonHref(overview.path.slug, current.slug) : "/post-test"}>{complete ? "Lihat hasil post-test" : offerBaseline ? "Buka pre-test" : current ? "Baca materi" : "Buka post-test"}<ArrowRight size={16} aria-hidden="true" /></Link></Button>
        {offerBaseline && current && <Link href={lessonHref(overview.path.slug, current.slug)} className="mt-3 flex min-h-11 items-center text-sm font-medium text-accent hover:underline">Langsung membaca materi</Link>}
        <nav aria-label="Alur belajar" className="mt-10 divide-y divide-border border-y border-border">{[["/pre-test", "Pre-test", pre?.result ? "Pemahaman awal tercatat" : "Kenali pemahaman awal"], [learningPathHref(overview.path.slug), "Materi", `${overview.metrics.completedRequiredLessons}/${overview.metrics.totalRequiredLessons} selesai dibaca`], ["/lab", "Lab SQL", "Coba query dan eksplorasi visual"], ["/post-test", "Post-test", post?.result?.passed ? "Lulus" : post?.available ? "Siap dikerjakan" : "Setelah membaca semua materi"]].map(([href, title, description]) => <Link key={href} href={href!} className="flex min-h-16 items-center justify-between gap-4 py-4 focus-visible:outline-2 focus-visible:outline-ring"><span><span className="block font-semibold">{title}</span><span className="mt-1 block text-sm text-muted-foreground">{description}</span></span><ArrowRight size={17} className="shrink-0" aria-hidden="true" /></Link>)}</nav>
      </section>
      <aside aria-label="Progres membaca" className="border-t border-border pt-7 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0"><ProgressSummary metrics={overview.metrics} /><p className="mt-6 border-t border-border pt-5 text-sm leading-6 text-muted-foreground">Latihan di Lab boleh diulang sesukamu. Nilai post-test dicatat terpisah dari progres membaca.</p></aside>
    </div>}
  </main>;
}
