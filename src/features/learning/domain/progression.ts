import type { LearningMetrics, LessonOutline, LessonWithState, ProgressRecord } from "@/features/learning/types";

export function orderLessons(lessons: LessonOutline[]): LessonOutline[] {
  return [...lessons].sort((a, b) =>
    a.chapterPosition - b.chapterPosition || a.position - b.position || a.id.localeCompare(b.id),
  );
}

export interface AssessmentGate {
  gateAfterChapter: number;
  passed: boolean;
}

export function deriveLessonStates(lessons: LessonOutline[], progress: ProgressRecord[], assessmentGates: AssessmentGate[] = [], baselineComplete = true): LessonWithState[] {
  const progressByLesson = new Map(progress.map((item) => [item.lesson_id, item]));
  let requiredPrerequisitesComplete = true;

  return orderLessons(lessons).map((lesson) => {
    const record = progressByLesson.get(lesson.id);
    const saved = record?.status;
    const assessmentPrerequisitesComplete = assessmentGates.every((gate) =>
      lesson.chapterPosition <= gate.gateAfterChapter || gate.passed,
    );
    const state = saved === "COMPLETED"
      ? "COMPLETED"
      : baselineComplete && requiredPrerequisitesComplete && assessmentPrerequisitesComplete
        ? saved === "IN_PROGRESS" ? "IN_PROGRESS" : "AVAILABLE"
        : "LOCKED";

    if (lesson.chapterIsRequired && lesson.is_required && state !== "COMPLETED") {
      requiredPrerequisitesComplete = false;
    }
    return { ...lesson, state, readAt: record?.read_at ?? null };
  });
}

export function calculateLearningMetrics(lessons: LessonWithState[]): LearningMetrics {
  const required = lessons.filter((lesson) => lesson.chapterIsRequired && lesson.is_required);
  const completedRequiredLessons = required.filter((lesson) => lesson.state === "COMPLETED").length;
  const nextAvailableLesson = required.find((lesson) => lesson.state === "AVAILABLE" || lesson.state === "IN_PROGRESS") ?? null;
  const currentLesson = required.find((lesson) => lesson.state === "IN_PROGRESS") ?? nextAvailableLesson;

  return {
    totalRequiredLessons: required.length,
    completedRequiredLessons,
    percentage: required.length === 0 ? 0 : Math.round((completedRequiredLessons / required.length) * 100),
    currentLesson,
    nextAvailableLesson,
  };
}

export function mayOpenLesson(lesson: LessonWithState, authenticated: boolean): boolean {
  return authenticated ? lesson.state !== "LOCKED" : lesson.is_preview;
}

export function resolveLessonRoute(lessons: LessonWithState[], slug: string, authenticated: boolean): LessonWithState | null {
  const lesson = lessons.find((item) => item.slug === slug);
  return lesson && mayOpenLesson(lesson, authenticated) ? lesson : null;
}

export function ownsProgress(authenticatedUserId: string | null, ownerId: string): boolean {
  return authenticatedUserId !== null && authenticatedUserId === ownerId;
}
