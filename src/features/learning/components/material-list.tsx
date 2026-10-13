import { useText } from "@/i18n/use-text";
import type { LessonWithState } from "../types";
import { MaterialItem } from "./material-item";

export function MaterialList({ lessons, pathSlug, authenticated, guest = false }: {
  lessons: LessonWithState[];
  pathSlug: string;
  authenticated: boolean;
  guest?: boolean;
}) {
  const tx = useText();
  const current = authenticated
    ? lessons.find((lesson) => lesson.state === "IN_PROGRESS" || lesson.state === "AVAILABLE")?.id
    : undefined;

  return (
    <ol aria-label={tx("Materi")} className="space-y-3">
      {lessons.map((lesson, index) => (
        <MaterialItem key={lesson.id} lesson={lesson} index={index}
          pathSlug={pathSlug} authenticated={authenticated} guest={guest}
          current={lesson.id === current} />
      ))}
    </ol>
  );
}
