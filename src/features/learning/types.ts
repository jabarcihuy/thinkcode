import type { Tables } from "@/types/database";

export type LearningPath = Pick<Tables<"learning_paths">, "id" | "slug" | "title" | "description">;
export type Chapter = Pick<Tables<"chapters">, "id" | "title" | "description" | "position" | "is_required">;
export type LessonRecord = Pick<Tables<"lessons">, "id" | "chapter_id" | "slug" | "title" | "summary" | "position" | "is_required" | "is_preview">;
export type ProgressRecord = Pick<Tables<"lesson_progress">, "lesson_id" | "status">;

export interface LessonOutline extends LessonRecord {
  chapterPosition: number;
  chapterTitle: string;
  chapterIsRequired: boolean;
}

export type LessonState = "COMPLETED" | "IN_PROGRESS" | "AVAILABLE" | "LOCKED";

export interface LessonWithState extends LessonOutline {
  state: LessonState;
}

export interface LearningMetrics {
  totalRequiredLessons: number;
  completedRequiredLessons: number;
  percentage: number;
  currentLesson: LessonWithState | null;
  nextAvailableLesson: LessonWithState | null;
}

export interface LearningOverview {
  path: LearningPath;
  chapters: Chapter[];
  lessons: LessonWithState[];
  metrics: LearningMetrics;
}
