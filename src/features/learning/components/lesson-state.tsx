import type { LessonState } from "@/features/learning/types";

/**
 * Lesson state, expressed in the world's own vocabulary: line form.
 *
 * A film frame carries its state in the shape of its tick, so a learner can
 * read the list without relying on hue. Each state gets a distinct mark:
 *   completed  solid long bar (the frame has been run)
 *   live       short accent bar (this is the frame in the gate)
 *   available  hairline bar (loaded, not yet run)
 *   locked     dashed hairline (not on the reel yet)
 *
 * Every mark is aria-hidden and the state is always spelled out in text beside
 * it, so nothing depends on seeing the shape.
 */
const marks: Record<LessonState, string> = {
  COMPLETED: "w-5 bg-foreground",
  IN_PROGRESS: "w-3 bg-live",
  AVAILABLE: "w-5 bg-muted-foreground/50",
  LOCKED: "w-5 bg-border",
};

const labels: Record<LessonState, string> = {
  COMPLETED: "Selesai",
  IN_PROGRESS: "Sedang berjalan",
  AVAILABLE: "Tersedia",
  LOCKED: "Terkunci",
};

const tone: Record<LessonState, string> = {
  COMPLETED: "text-foreground",
  IN_PROGRESS: "text-live-ink",
  AVAILABLE: "text-foreground",
  LOCKED: "text-muted-foreground",
};

export function LessonStateLabel({ state }: { state: LessonState }) {
  const dashed = state === "LOCKED";
  return (
    <span className={`inline-flex items-center gap-2 text-xs font-semibold ${tone[state]}`}>
      <span
        aria-hidden="true"
        className={`h-0.5 rounded-full ${marks[state]} ${dashed ? "opacity-70" : ""}`}
        style={dashed ? { backgroundImage: "repeating-linear-gradient(to right, currentColor 0 3px, transparent 3px 6px)", backgroundColor: "transparent" } : undefined}
      />
      {labels[state]}
    </span>
  );
}
