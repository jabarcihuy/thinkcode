import { describe, expect, it } from "vitest";
import { nextLearningAction } from "./next-action";
import type { LearningOverview } from "../types";
const lesson = { id: "a", chapter_id: "c", title: "Data", slug: "data", summary: "", position: 1, is_required: true, is_preview: true, chapterPosition: 1, chapterTitle: "Relasi", chapterIsRequired: true, state: "AVAILABLE" as const };
const overview: LearningOverview = { path: { id: "p", slug: "database-fundamentals", title: "Database", description: "" }, chapters: [], lessons: [lesson], baselineComplete: true, metrics: { totalRequiredLessons: 1, completedRequiredLessons: 0, percentage: 0, currentLesson: lesson, nextAvailableLesson: lesson } };
describe("resume the mandatory journey", () => {
  it("prioritizes an active test over reading", () => expect(nextLearningAction(overview, "session", false).href).toBe("/assessments/sessions/session"));
  it("opens the first material without a historical baseline", () => expect(nextLearningAction({ ...overview, baselineComplete: false }, null, false).href).toBe("/learn/database-fundamentals/lessons/data"));
  it("resumes core Lab after reading acknowledgement", () => expect(nextLearningAction({ ...overview, metrics: { ...overview.metrics, currentLesson: { ...lesson, readAt: "today" } } }, null, false).href).toMatch(/\/practice#lesson-practice$/));
  it("offers post-test after all material completion", () => expect(nextLearningAction({ ...overview, metrics: { ...overview.metrics, currentLesson: null } }, null, false).label).toBe("Mulai tantangan akhir"));
});
