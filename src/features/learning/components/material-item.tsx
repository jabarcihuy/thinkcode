import Link from "next/link";
import Image from "next/image";
import styles from "./mobile-lms.module.css";
import { ArrowRight } from "lucide-react";
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
  const group = lesson.chapterTitle.toLowerCase();
  const artwork = group.includes("write") ? "write" : group.includes("read") ? "read" : "relations";
  const content = (
    <>
      <span aria-hidden="true" className={styles.materialArt} data-tone={artwork}>
        <Image src={`/assets/quethink/lesson-${artwork}.svg`} alt="" width={96} height={96} unoptimized />
        <span className="text-xs font-semibold tabular-nums text-primary">{String(index + 1).padStart(2, "0")}</span>
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
  const className = styles.materialTile;
  const href = lessonHref(pathSlug, lesson.slug);
  return (
    <li>
      {accessible ? (
        <Link href={guest ? guestHref(href) : href} aria-current={current ? "step" : undefined}
          className={className}>
          {content}
        </Link>
      ) : <div className={className}>{content}</div>}
    </li>
  );
}
