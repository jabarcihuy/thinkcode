import "server-only";
import { getLearningOverview } from "@/features/learning/data/learning-repository";
import { persistLessonStart } from "@/features/learning/data/progress-repository";
import type { LessonWithState } from "@/features/learning/types";

export class LessonAccessError extends Error {
  constructor() {
    super("Lesson tidak tersedia untuk akun ini.");
    this.name = "LessonAccessError";
  }
}

async function requireMutableLesson(userId: string, pathSlug: string, lessonId: string): Promise<LessonWithState> {
  const overview = await getLearningOverview(pathSlug, userId);
  const lesson = overview?.lessons.find((item) => item.id === lessonId);
  if (!lesson || lesson.state === "LOCKED") throw new LessonAccessError();
  return lesson;
}

export async function startLesson(userId: string, pathSlug: string, lessonId: string): Promise<LessonWithState> {
  const lesson = await requireMutableLesson(userId, pathSlug, lessonId);
  await persistLessonStart(lessonId);
  return lesson;
}
