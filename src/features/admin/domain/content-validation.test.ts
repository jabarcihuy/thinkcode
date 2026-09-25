import { describe, expect, it } from "vitest";
import { assessmentInput, assessmentItemInput, chapterInput, exerciseInput, lessonInput, pathInput, testCaseInput } from "@/features/admin/domain/content-validation";

const id = "00000000-0000-4000-8000-000000000001";
const exerciseBase = { lesson_id: id, title: "Draft", prompt: "Solve this step.", position: 1, is_required: true };

describe("admin CMS content validation", () => {
  it("requires complete lesson content and a valid slug", () => {
    expect(lessonInput.safeParse({ chapter_id: id, title: "", slug: "bad slug", content: "", position: 1 }).success).toBe(false);
    expect(lessonInput.safeParse({ chapter_id: id, title: "Intro", slug: "intro", content: "# Intro", position: 1 }).success).toBe(true);
  });

  it("keeps new path, chapter, and assessment drafts valid without publishing", () => {
    expect(pathInput.parse({ title: "Path", slug: "path", position: 1 }).is_published).toBe(false);
    expect(chapterInput.safeParse({ learning_path_id: id, title: "Chapter", position: 1 }).success).toBe(true);
    expect(assessmentInput.safeParse({ learning_path_id: id, title: "Checkpoint", slug: "checkpoint", type: "CHECKPOINT", passing_score: 75, gate_after_chapter: 3, position: 1 }).success).toBe(true);
    expect(assessmentInput.safeParse({ learning_path_id: id, title: "Checkpoint", slug: "checkpoint", type: "CHECKPOINT", passing_score: 101, gate_after_chapter: 3, position: 1 }).success).toBe(false);
  });

  it("accepts all supported exercise types with their matching configuration", () => {
    const cases = [
      { type: "CODE_COMPLETION", starter_code: "console.log(1);" },
      { type: "PREDICT_OUTPUT", starter_code: "console.log(1);", config: { answer: { output: "1" } } },
      { type: "DEBUGGING", starter_code: "console.log(1);" },
      { type: "PROBLEM_SOLVING", starter_code: "function solve() {}" },
      { type: "PSEUDOCODE", public_config: { mode: "order", blocks: [{ id: "a", text: "Start" }, { id: "b", text: "Stop" }] }, config: { answer: { order: ["a", "b"] } } },
      { type: "FLOWCHART", public_config: { mode: "choice", options: [{ id: "yes", text: "Yes" }, { id: "no", text: "No" }] }, config: { answer: { choiceId: "yes" } } },
    ] as const;
    for (const details of cases) expect(exerciseInput.safeParse({ ...exerciseBase, ...details }).success, details.type).toBe(true);
    expect(exerciseInput.safeParse({ ...exerciseBase, type: "PSEUDOCODE", public_config: {}, config: {} }).success).toBe(false);
  });

  it("validates hidden test values and assessment item private answer config", () => {
    expect(testCaseInput.safeParse({ exercise_id: id, is_hidden: true, weight: 1, position: 1 }).success).toBe(true);
    expect(assessmentItemInput.safeParse({ assessment_id: id, type: "PREDICT_OUTPUT", title: "Predict", topic: "variables", prompt: "What prints?", position: 1, weight: 1, public_config: {}, answer_config: { output: "2" } }).success).toBe(true);
  });
});
