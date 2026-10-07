import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { guestHref } from "@/features/guest/domain/links";
import { lessonHref } from "../config";
import { mayOpenLesson } from "../domain/progression";
import type { LessonWithState } from "../types";
import { LessonStateLabel } from "./lesson-state";

export function MaterialList({ lessons, pathSlug, authenticated, guest = false }: { lessons: LessonWithState[]; pathSlug: string; authenticated: boolean; guest?: boolean }) {
  return <ol className="divide-y divide-border border-y border-border">{lessons.map((lesson, index) => {
    const accessible = mayOpenLesson(lesson, authenticated);
    const content = <><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-5"><h2 className="text-xl font-semibold tracking-tight"><span className="text-accent">Materi {index + 1}.</span> {lesson.title}</h2><span className="shrink-0 sm:pt-1"><LessonStateLabel state={authenticated ? lesson.state : accessible ? "AVAILABLE" : "LOCKED"} /></span></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{lesson.summary}</p>{accessible && <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent">Baca materi<ArrowRight size={16} aria-hidden="true" /></span>}</>;
    return <li key={lesson.id}>{accessible ? <Link href={guest ? guestHref(lessonHref(pathSlug, lesson.slug)) : lessonHref(pathSlug, lesson.slug)} className="block rounded-sm py-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:py-7">{content}</Link> : <div className="py-6 text-muted-foreground sm:py-7">{content}</div>}</li>;
  })}</ol>;
}
