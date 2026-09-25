import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentAccount } from "@/lib/auth/session";
import { ChapterSequence } from "@/features/learning/components/chapter-sequence";
import { LearningHeader } from "@/features/learning/components/learning-header";
import { ProgressSummary } from "@/features/learning/components/progress-summary";
import { getLearningOverview } from "@/features/learning/data/learning-repository";
import { lessonHref } from "@/features/learning/config";
import { pathSlugSchema } from "@/features/learning/validation/routes";

export default async function LearningPathPage({ params }: { params: Promise<{ pathSlug: string }> }) {
  const { pathSlug } = await params;
  if (!pathSlugSchema.safeParse(pathSlug).success) notFound();
  const account = await getCurrentAccount();
  const overview = await getLearningOverview(pathSlug, account?.userId ?? null);
  if (!overview) notFound();
  const current = overview.metrics.currentLesson;

  return <div className="min-h-screen">
    <LearningHeader account={account} />
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{overview.path.title}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{overview.path.description}</p>
      </div>
      <div className="mt-12 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
        <div><ChapterSequence chapters={overview.chapters} lessons={overview.lessons} pathSlug={pathSlug} authenticated={Boolean(account)} /></div>
        <aside className="order-first rounded-xl bg-muted p-6 lg:order-last lg:sticky lg:top-8" aria-label="Ringkasan jalur belajar">
          {account ? <>
            <ProgressSummary metrics={overview.metrics} />
            {current && <div className="mt-7 border-t border-border pt-6"><p className="text-sm text-muted-foreground">Lanjutkan dari</p><p className="mt-1 font-semibold">{current.title}</p><Button asChild className="mt-4 w-full"><Link href={lessonHref(pathSlug, current.slug)}>Buka lesson</Link></Button></div>}
            {!current && overview.metrics.totalRequiredLessons > 0 && <p className="mt-6 text-sm font-medium text-primary">Semua lesson wajib yang tersedia sudah selesai.</p>}
          </> : <><h2 className="text-lg font-semibold">Mulai belajar terarah</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Baca lesson preview, lalu buat akun untuk menyimpan progres dan membuka jalur belajar.</p><Button asChild className="mt-6 w-full"><Link href="/register">Buat akun</Link></Button></>}
        </aside>
      </div>
    </main>
  </div>;
}
