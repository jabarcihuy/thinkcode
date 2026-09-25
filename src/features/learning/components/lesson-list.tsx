import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { mayOpenLesson } from "@/features/learning/domain/progression";
import { LessonStateLabel } from "@/features/learning/components/lesson-state";
import type { LessonWithState } from "@/features/learning/types";

export function LessonList({ lessons, pathSlug, authenticated }: { lessons: LessonWithState[]; pathSlug: string; authenticated: boolean }) {
  if (lessons.length === 0) return <p className="py-5 text-sm text-muted-foreground">Materi chapter ini sedang disiapkan.</p>;

  return <ol className="divide-y divide-border border-t border-border">
    {lessons.map((lesson) => {
      const open = mayOpenLesson(lesson, authenticated);
      const body = <>
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-foreground">{lesson.title}</span>
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{lesson.summary}</span>
          {!lesson.is_required && <span className="mt-2 inline-flex rounded-sm border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Optional</span>}
        </span>
        <span className="flex shrink-0 flex-col items-end gap-2 text-right">
          {authenticated ? <LessonStateLabel state={lesson.state} /> : <span className="text-xs font-semibold text-primary">Preview</span>}
          {open && <ArrowUpRight size={16} aria-hidden="true" className="text-muted-foreground" />}
        </span>
      </>;

      return <li key={lesson.id}>
        {open
          ? <Link className="flex min-h-19 items-start gap-4 rounded-md px-2 py-4 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" href={`/learn/${pathSlug}/lessons/${lesson.slug}`}>{body}</Link>
          : <div className="flex min-h-19 items-start gap-4 px-2 py-4 opacity-70" aria-label={`${lesson.title}, terkunci`}>{body}</div>}
      </li>;
    })}
  </ol>;
}
