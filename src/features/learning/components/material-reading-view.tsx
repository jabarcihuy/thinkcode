import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonContent } from "@/features/learning/components/lesson-content";
import { MaterialDownload } from "@/features/learning/components/material-download";
import { AcknowledgeReading } from "@/features/learning/components/acknowledge-reading";
import { mayOpenLesson } from "@/features/learning/domain/progression";
import { lessonHref, lessonPdfHref, lessonPracticeHref, learningPathHref } from "@/features/learning/config";

import { guestHref } from "@/features/guest/domain/links";
import type { LearningOverview } from "../types";
export function MaterialReadingView({ overview, index, content, authenticated, guest = false }: { overview: LearningOverview; index: number; content: string; authenticated: boolean; guest?: boolean }) {
 const lesson = overview.lessons[index]!;
 const pathSlug = overview.path.slug;
 const lessonSlug = lesson.slug;
 const previous = overview.lessons[index - 1];
 const next = overview.lessons[index + 1];
 const href = (value: string) => guest ? guestHref(value) : value;
 return (    <main id="main-content" className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline" href={href(learningPathHref(pathSlug))}><ArrowLeft size={16} aria-hidden="true" />Semua materi</Link>
      <article>
        <div className="mt-6 flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0"><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl"><span className="text-accent">Materi {index + 1}.</span> {lesson.title}</h1><p className="mt-4 leading-7 text-muted-foreground">{lesson.summary}</p></div>
          <div className="shrink-0"><MaterialDownload href={guest ? `/api/guest/pdf/${lessonSlug}` : lessonPdfHref(pathSlug, lessonSlug)} number={index + 1} /></div>
        </div>
        <div className="mt-8"><LessonContent content={content} /></div>
      </article>
      <section aria-label="Lanjut belajar" className="mt-10 border-t border-border pt-7">
        {authenticated ? <><h2 className="text-lg font-semibold">Selesai membaca?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Lanjutkan ke latihan inti untuk membuka materi berikutnya.</p><div className="mt-4"><AcknowledgeReading lessonId={lesson.id} completed={Boolean(lesson.readAt) || lesson.state === "COMPLETED"} labHref={`${href(lessonPracticeHref(pathSlug, lessonSlug))}#lesson-practice`} /></div>{!next && lesson.state === "COMPLETED" && <Button asChild className="mt-5 w-full sm:ml-4 sm:w-auto"><Link href={href("/post-test")}>Buka tes akhir</Link></Button>}</> : <Button asChild><Link href="/register">Buat akun untuk menyimpan progres</Link></Button>}
      </section>
      <nav aria-label="Navigasi materi" className="mt-8 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:justify-between">
        <div>{previous && mayOpenLesson(previous, authenticated) && <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline" href={href(lessonHref(pathSlug, previous.slug))}><ArrowLeft size={16} aria-hidden="true" />Materi {index}</Link>}</div>
        <div>{next && (mayOpenLesson(next, authenticated) ? <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline" href={href(lessonHref(pathSlug, next.slug))}>Materi {index + 2}<ArrowRight size={16} aria-hidden="true" /></Link> : <span className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"><LockKeyhole size={16} aria-hidden="true" />Materi {index + 2} terkunci</span>)}</div>
      </nav>
    </main>);
}
