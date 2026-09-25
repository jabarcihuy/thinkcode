import { describe, expect, it } from "vitest";
import { calculateLearningMetrics, deriveLessonStates, ownsProgress, resolveLessonRoute } from "./progression";
import type { LessonOutline, ProgressRecord } from "@/features/learning/types";

const lessons: LessonOutline[] = [
  { id: "first", chapter_id: "chapter-1", slug: "first", title: "First", summary: "", position: 1, is_required: true, is_preview: true, chapterPosition: 1, chapterTitle: "Basics", chapterIsRequired: true },
  { id: "optional", chapter_id: "chapter-1", slug: "optional", title: "Optional", summary: "", position: 2, is_required: false, is_preview: false, chapterPosition: 1, chapterTitle: "Basics", chapterIsRequired: true },
  { id: "second", chapter_id: "chapter-2", slug: "second", title: "Second", summary: "", position: 1, is_required: true, is_preview: false, chapterPosition: 2, chapterTitle: "Next", chapterIsRequired: true },
];

function completed(...ids: string[]): ProgressRecord[] {
  return ids.map((lesson_id) => ({ lesson_id, status: "COMPLETED" }));
}

describe("sequential progression", () => {
  it("makes only the first lesson available at the start", () => {
    const states = deriveLessonStates(lessons, []);
    expect(states.map((lesson) => lesson.state)).toEqual(["AVAILABLE", "LOCKED", "LOCKED"]);
  });

  it("unlocks the next required lesson when its prerequisite is complete", () => {
    const states = deriveLessonStates(lessons, completed("first"));
    expect(states.map((lesson) => lesson.state)).toEqual(["COMPLETED", "AVAILABLE", "AVAILABLE"]);
  });

  it("does not let an optional lesson block the next required lesson", () => {
    const states = deriveLessonStates(lessons, completed("first"));
    expect(states.find((lesson) => lesson.id === "optional")?.state).toBe("AVAILABLE");
    expect(states.find((lesson) => lesson.id === "second")?.state).toBe("AVAILABLE");
  });

  it("requires a passed checkpoint before opening lessons in the next chapter group", () => {
    const gated = deriveLessonStates(lessons, completed("first"), [{ gateAfterChapter: 1, passed: false }]);
    expect(gated.find((lesson) => lesson.id === "second")?.state).toBe("LOCKED");
    const passed = deriveLessonStates(lessons, completed("first"), [{ gateAfterChapter: 1, passed: true }]);
    expect(passed.find((lesson) => lesson.id === "second")?.state).toBe("AVAILABLE");
  });

  it("denies a locked lesson even when its URL is known", () => {
    expect(resolveLessonRoute(deriveLessonStates(lessons, []), "second", true)).toBeNull();
  });
});

describe("progress calculation", () => {
  it("reports zero progress and the first required lesson", () => {
    const metrics = calculateLearningMetrics(deriveLessonStates(lessons, []));
    expect(metrics).toMatchObject({ totalRequiredLessons: 2, completedRequiredLessons: 0, percentage: 0 });
    expect(metrics.nextAvailableLesson?.id).toBe("first");
  });

  it("reports partial progress and the next required lesson", () => {
    const metrics = calculateLearningMetrics(deriveLessonStates(lessons, completed("first")));
    expect(metrics).toMatchObject({ completedRequiredLessons: 1, percentage: 50 });
    expect(metrics.currentLesson?.id).toBe("second");
    expect(metrics.nextAvailableLesson?.id).toBe("second");
  });

  it("reports full progress with no next required lesson", () => {
    const metrics = calculateLearningMetrics(deriveLessonStates(lessons, completed("first", "second")));
    expect(metrics).toMatchObject({ completedRequiredLessons: 2, percentage: 100, currentLesson: null, nextAvailableLesson: null });
  });
});

describe("learning authorization", () => {
  it("allows guests to open previews but not other lessons", () => {
    const states = deriveLessonStates(lessons, []);
    expect(resolveLessonRoute(states, "first", false)?.id).toBe("first");
    expect(resolveLessonRoute(states, "second", false)).toBeNull();
  });

  it("blocks access to another user's progress", () => {
    expect(ownsProgress("user-a", "user-a")).toBe(true);
    expect(ownsProgress("user-a", "user-b")).toBe(false);
    expect(ownsProgress(null, "user-b")).toBe(false);
  });
});
