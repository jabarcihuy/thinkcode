import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LearningHeader } from "@/features/learning/components/learning-header";
import { LessonContent } from "@/features/learning/components/lesson-content";
import { MaterialDownload } from "@/features/learning/components/material-download";
import { AcknowledgeReading } from "@/features/learning/components/acknowledge-reading";
import { getAccessibleMaterial } from "@/features/learning/server/material-access";
import { mayOpenLesson } from "@/features/learning/domain/progression";
import { lessonHref, lessonPdfHref, lessonPracticeHref, learningPathHref } from "@/features/learning/config";

export default async function LessonPage({ params }: { params: Promise<{ pathSlug: string; lessonSlug: string }> }) {
  const { pathSlug, lessonSlug } = await params;
  const access = await getAccessibleMaterial(pathSlug, lessonSlug);
  if (!access) notFound();
  const { account, overview, lesson, material, index } = access;
  const previous = overview.lessons[index - 1];
  const next = overview.lessons[index + 1];
  return <div className="min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
    <LearningHeader account={account} />
    <main id="main-content" className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline" href={learningPathHref(pathSlug)}><ArrowLeft size={16} aria-hidden="true" />Semua materi</Link>
      <article>
        <div className="mt-6 flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0"><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl"><span className="text-accent">Materi {index + 1}.</span> {lesson.title}</h1><p className="mt-4 leading-7 text-muted-foreground">{lesson.summary}</p></div>
          <div className="shrink-0"><MaterialDownload href={lessonPdfHref(pathSlug, lessonSlug)} number={index + 1} /></div>
        </div>
        <div className="mt-8"><LessonContent content={material.content} /></div>
      </article>
      <section aria-label="Lanjut belajar" className="mt-10 border-t border-border pt-7">
        {account ? <><h2 className="text-lg font-semibold">Selesai membaca?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Tandai bacaan ini, lalu tuntaskan latihan inti di Lab untuk membuka materi berikutnya.</p><div className="mt-4"><AcknowledgeReading lessonId={lesson.id} completed={Boolean(lesson.readAt) || lesson.state === "COMPLETED"} /></div><Link className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline" href={lessonPracticeHref(pathSlug, lessonSlug)}>Lanjut ke Lab · latihan inti<ArrowRight size={16} aria-hidden="true" /></Link>{!next && lesson.state === "COMPLETED" && <Button asChild className="mt-5 w-full sm:ml-4 sm:w-auto"><Link href="/post-test">Buka post-test</Link></Button>}</> : <Button asChild><Link href="/register">Buat akun untuk menyimpan progres</Link></Button>}
      </section>
      <nav aria-label="Navigasi materi" className="mt-8 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:justify-between">
        <div>{previous && mayOpenLesson(previous, Boolean(account)) && <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline" href={lessonHref(pathSlug, previous.slug)}><ArrowLeft size={16} aria-hidden="true" />Materi {index}</Link>}</div>
        <div>{next && (mayOpenLesson(next, Boolean(account)) ? <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline" href={lessonHref(pathSlug, next.slug)}>Materi {index + 2}<ArrowRight size={16} aria-hidden="true" /></Link> : <span className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"><LockKeyhole size={16} aria-hidden="true" />Materi {index + 2} terkunci</span>)}</div>
      </nav>
    </main>
  </div>;
}
