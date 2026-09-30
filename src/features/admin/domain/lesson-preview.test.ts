import { describe, expect, it } from "vitest";
import { toPreviewExercise } from "./lesson-preview";

describe("admin preview serialization", () => {
  it("copies display fields only and strips private data even inside public configuration", () => {
    const row = { id: "exercise", lesson_id: "lesson", type: "PSEUDOCODE" as const, title: "Key", prompt: "Pilih key", starter_code: null, position: 1, is_required: true,
      public_config: { mode: "choice", datasetId: "shop", options: [{ id: "pk", text: "Primary key", hiddenInput: "PRIVATE_INPUT" }], answer: "PRIVATE_ANSWER", grading: { hidden: "PRIVATE_TEST" } },
      config: { answer: "PRIVATE_CONFIG" }, solution_code: "PRIVATE_SOLUTION", hiddenTests: ["PRIVATE_CASE"] };
    const preview = toPreviewExercise(row);
    const serialized = JSON.stringify(preview);
    expect(serialized).not.toContain("PRIVATE");
    expect(preview.publicConfig).toEqual({ mode: "choice", datasetId: "shop", options: [{ id: "pk", text: "Primary key" }] });
    expect(preview.passed).toBe(false);
    expect(preview.visibleTests).toEqual([]);
  });
  it("allows an incomplete draft display without introducing progress or answer fields", () => {
    const preview = toPreviewExercise({ id: "draft", lesson_id: "lesson", type: "PREDICT_OUTPUT", title: "Draft", prompt: "Predict", starter_code: "SELECT title FROM books;", public_config: null, position: 1, is_required: false });
    expect(preview.publicConfig).toBeNull();
    expect(Object.keys(preview)).not.toContain("answer");
    expect(Object.keys(preview)).not.toContain("score");
  });
});
