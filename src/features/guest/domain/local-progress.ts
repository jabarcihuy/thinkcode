import { z } from "zod";
import { calculateLearningMetrics, deriveLessonStates } from "@/features/learning/domain/progression";
import type { LearningOverview, LessonOutline, ProgressRecord } from "@/features/learning/types";

export const GUEST_LOCAL_PREFIX = "quethink:guest-local:v1:";
export const guestResultSchema = z.object({ score: z.number().min(0).max(100), totalCorrect: z.number().int().nonnegative(), totalItems: z.number().int().positive(), passed: z.boolean(), highestScore: z.number().min(0).max(100).optional(), topicSummary: z.array(z.object({ topic: z.string().max(200), passed: z.boolean() })).max(100).optional() });
export const guestProgressSchema = z.object({
  name: z.string().max(60),
  read: z.record(z.uuid(), z.string().datetime()),
  passedExercises: z.array(z.uuid()).max(1000),
  tests: z.record(z.uuid(), guestResultSchema),
});
export type GuestLocalProgress = z.infer<typeof guestProgressSchema>;
export const emptyGuestProgress: GuestLocalProgress = { name: "", read: {}, passedExercises: [], tests: {} };
export interface GuestLearningCatalog {
  path: LearningOverview["path"] | null;
  lessons: LessonOutline[];
  exercises: { id: string; lesson_id: string }[];
  tests: { id: string; title: string; type: string; passing_score: number }[];
}
export function guestDraftKey(key: string): string {
  // A new signed guest session must restore the same device draft, not create a new one.
  return GUEST_LOCAL_PREFIX + key.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, "device");
}
export function guestOverview(catalog: GuestLearningCatalog, local: GuestLocalProgress): LearningOverview | null {
  if (!catalog.path) return null;
  const passed = new Set(local.passedExercises);
  const progress: ProgressRecord[] = catalog.lessons.flatMap((lesson) => {
    const readAt = local.read[lesson.id];
    if (!readAt) return [];
    const required = catalog.exercises.filter((exercise) => exercise.lesson_id === lesson.id);
    return [{ lesson_id: lesson.id, read_at: readAt, status: required.length > 0 && required.every((exercise) => passed.has(exercise.id)) ? "COMPLETED" : "IN_PROGRESS" }];
  });
  const baselineComplete = true; // Historical local diagnostic results are retained but no longer gate learning.
  const lessons = deriveLessonStates(catalog.lessons, progress, [], baselineComplete);
  return { path: catalog.path, chapters: [], lessons, baselineComplete, metrics: calculateLearningMetrics(lessons) };
}
