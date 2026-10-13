import Link from "next/link";
import { ArrowRight, BookOpen, Check, LockKeyhole } from "lucide-react";
import { useText } from "@/i18n/use-text";
import { guestHref } from "@/features/guest/domain/links";
import { lessonHref } from "../config";
import { mayOpenLesson } from "../domain/progression";
import type { LessonWithState } from "../types";
import { LessonStateLabel } from "./lesson-state";

export function MaterialItem({ lesson, index, pathSlug, authenticated, guest, current }: {
  lesson: LessonWithState;
  index: number;
  pathSlug: string;
  authenticated: boolean;
  guest: boolean;
  current: boolean;
}) {
  const tx = useText();
  const accessible = mayOpenLesson(lesson, authenticated);
  const state = authenticated ? lesson.state : accessible ? "AVAILABLE" : "LOCKED";
  const Icon = state === "COMPLETED" ? Check : accessible ? BookOpen : LockKeyhole;
  const content = (
    <>
      <span aria-hidden="true" className={`flex w-12 shrink-0 flex-col items-center justify-center gap-2 self-start rounded-md py-3 ${accessible ? "bg-secondary text-primary" : "bg-muted text-muted-foreground"}`}>
        <Icon size={20} strokeWidth={1.7} />
        <span className="text-xs font-semibold tabular-nums">{String(index + 1).padStart(2, "0")}</span>
      </span>
      <div className="min-w-0 flex-1">
        <span className="mb-2 block"><LessonStateLabel state={state} /></span>
        <h2 className="text-lg font-semibold leading-snug tracking-tight">
          <span className="sr-only">{index + 1}. </span>{tx(lesson.title)}
        </h2>
        <span className="mt-2 block text-sm leading-6 text-muted-foreground">{tx(lesson.summary)}</span>
        {accessible && <span className="mt-3 inline-flex min-h-6 items-center gap-2 text-sm font-semibold text-primary">{tx("Baca")}<ArrowRight size={16} aria-hidden="true" /></span>}
      </div>
    </>
  );
  const className = `flex min-w-0 gap-3 rounded-lg border bg-white p-4 sm:gap-4 sm:p-6 ${current ? "border-primary" : "border-border"}`;
  const href = lessonHref(pathSlug, lesson.slug);
  return (
    <li>
      {accessible ? (
        <Link href={guest ? guestHref(href) : href} aria-current={current ? "step" : undefined}
          className={`${className} transition-colors hover:bg-secondary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`}>
          {content}
        </Link>
      ) : <div className={className}>{content}</div>}
    </li>
  );
}
