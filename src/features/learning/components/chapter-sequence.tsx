import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LessonList } from "@/features/learning/components/lesson-list";
import type { Chapter, LessonWithState } from "@/features/learning/types";

export function ChapterSequence({ chapters, lessons, pathSlug, authenticated }: { chapters: Chapter[]; lessons: LessonWithState[]; pathSlug: string; authenticated: boolean }) {
  return <div className="space-y-12">
    {chapters.map((chapter) => {
      const chapterLessons = lessons.filter((lesson) => lesson.chapter_id === chapter.id);
      const requiredLessons = chapterLessons.filter((lesson) => lesson.is_required);
      const completed = requiredLessons.length > 0 && requiredLessons.every((lesson) => lesson.state === "COMPLETED");
      const active = chapterLessons.some((lesson) => lesson.state === "AVAILABLE" || lesson.state === "IN_PROGRESS");
      return <section key={chapter.id} aria-labelledby={`chapter-${chapter.id}`} className="grid gap-5 sm:grid-cols-[3rem_minmax(0,1fr)]">
        <div aria-hidden="true" className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold tabular-nums ${completed ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{String(chapter.position).padStart(2, "0")}</div>
        <div className="min-w-0 border-b border-border pb-10">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h2 id={`chapter-${chapter.id}`} className="text-xl font-bold tracking-tight"><Link className="hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" href={`/learn/${pathSlug}/chapters/${chapter.id}`}>{chapter.title}</Link></h2><span className="text-xs font-semibold text-muted-foreground">{!authenticated ? "Preview" : !chapter.is_required ? "Optional" : completed ? "Completed" : active ? "Current" : "Locked"}</span></div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{chapter.description}</p>
            </div>
            <Link className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" href={`/learn/${pathSlug}/chapters/${chapter.id}`}>Lihat chapter <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          <div className="mt-5"><LessonList lessons={chapterLessons} pathSlug={pathSlug} authenticated={authenticated} /></div>
        </div>
      </section>;
    })}
  </div>;
}
