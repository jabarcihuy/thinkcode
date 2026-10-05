import { describe, expect, it } from "vitest";
import { assessmentInput, assessmentItemInput, chapterInput, exerciseInput, lessonInput, pathInput, testCaseInput } from "@/features/admin/domain/content-validation";

const id = "00000000-0000-4000-8000-000000000001";
const exerciseBase = { lesson_id: id, title: "Draft", prompt: "Solve this step.", position: 1, is_required: true };

describe("admin CMS content validation", () => {
  it("keeps diagnostic tests outside official scoring", () => {
    const input = { learning_path_id: id, title: "Pre-test", slug: "pre-test", type: "PRETEST", passing_score: 0, gate_after_chapter: 3, position: 1 };
    expect(assessmentInput.safeParse(input).success).toBe(true);
    expect(assessmentInput.safeParse({ ...input, passing_score: 75 }).success).toBe(false);
    expect(assessmentInput.safeParse({ ...input, course_weight_percent: 10 }).success).toBe(false);
  });
  it("requires complete lesson content and a valid slug", () => {
    expect(lessonInput.safeParse({ chapter_id: id, title: "", slug: "bad slug", content: "", position: 1 }).success).toBe(false);
    expect(lessonInput.safeParse({ chapter_id: id, title: "Intro", slug: "intro", content: "# Intro", position: 1 }).success).toBe(true);
    expect(lessonInput.safeParse({ chapter_id: id, title: "Intro", slug: "intro", content: "# Intro", example_sql: "SELECT * FROM students;", position: 1 }).success).toBe(true);
    expect(lessonInput.safeParse({ chapter_id: id, title: "Intro", slug: "intro", content: "# Intro", example_sql: "x".repeat(4_097), position: 1 }).success).toBe(false);
  });

  it("keeps new path, chapter, and assessment drafts valid without publishing", () => {
    expect(pathInput.parse({ title: "Path", slug: "path", position: 1 }).is_published).toBe(false);
    expect(chapterInput.safeParse({ learning_path_id: id, title: "Chapter", position: 1 }).success).toBe(true);
    expect(assessmentInput.safeParse({ learning_path_id: id, title: "Checkpoint", slug: "checkpoint", type: "CHECKPOINT", passing_score: 75, gate_after_chapter: 3, position: 1 }).success).toBe(true);
    expect(assessmentInput.parse({ learning_path_id: id, title: "Checkpoint", slug: "checkpoint", type: "CHECKPOINT", passing_score: 75, gate_after_chapter: 3, position: 1 }).course_weight_percent).toBe(0);
    expect(assessmentInput.safeParse({ learning_path_id: id, title: "Checkpoint", slug: "checkpoint", type: "CHECKPOINT", course_weight_percent: 101, passing_score: 75, gate_after_chapter: 3, position: 1 }).success).toBe(false);
    expect(assessmentInput.safeParse({ learning_path_id: id, title: "Checkpoint", slug: "checkpoint", type: "CHECKPOINT", passing_score: 101, gate_after_chapter: 3, position: 1 }).success).toBe(false);
  });

  it("accepts database exercise types and rejects programming exercises", () => {
    const cases = [
      { type: "PREDICT_OUTPUT", starter_code: "SELECT name FROM students;", config: { answer: { output: "Alya" } } },
      { type: "PSEUDOCODE", public_config: { mode: "order", blocks: [{ id: "a", text: "Start" }, { id: "b", text: "Stop" }] }, config: { answer: { order: ["a", "b"] } } },
      { type: "FLOWCHART", public_config: { mode: "choice", options: [{ id: "yes", text: "Relasi key benar" }, { id: "no", text: "Relasi key salah" }] }, config: { answer: { choiceId: "yes" } } },
    ] as const;
    for (const details of cases) expect(exerciseInput.safeParse({ ...exerciseBase, ...details }).success, details.type).toBe(true);
    for (const type of ["CODE_COMPLETION", "DEBUGGING", "PROBLEM_SOLVING"]) {
      expect(exerciseInput.safeParse({ ...exerciseBase, type, starter_code: "console.log(1);" }).success).toBe(false);
    }
    expect(exerciseInput.safeParse({ ...exerciseBase, type: "PSEUDOCODE", public_config: {}, config: {} }).success).toBe(false);
  });

  it("accepts registered exercise contexts and rejects arbitrary datasets", () => {
    const exercise = { ...exerciseBase, type: "PREDICT_OUTPUT", starter_code: "SELECT title FROM books;", config: { answer: { output: "Dasar Basis Data" } } };
    expect(exerciseInput.safeParse({ ...exercise, public_config: { datasetId: "library" } }).success).toBe(true);
    expect(exerciseInput.safeParse({ ...exercise, public_config: { datasetId: "production" } }).success).toBe(false);
  });

  it("validates hidden test values and assessment item private answer config", () => {
    expect(testCaseInput.safeParse({ exercise_id: id, is_hidden: true, weight: 1, position: 1 }).success).toBe(true);
    expect(assessmentItemInput.safeParse({ assessment_id: id, type: "PREDICT_OUTPUT", title: "Predict", topic: "variables", prompt: "What prints?", position: 1, weight: 1, public_config: {}, answer_config: { output: "2" } }).success).toBe(true);
  });
});

it("preserves deterministic core flags instead of silently making them optional", () => {
  const parsed = exerciseInput.parse({ ...exerciseBase, type: "PREDICT_OUTPUT", config: { answer: { output: "Alya" } } });
  expect(parsed.is_required).toBe(true);
});
