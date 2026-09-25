import { describe, expect, it } from "vitest";
import { exerciseKind } from "./exercise-renderer";

describe("exercise renderer", () => {
  it("chooses the coding and prediction renderers by type", () => {
    expect(exerciseKind("CODE_COMPLETION")).toBe("coding");
    expect(exerciseKind("DEBUGGING")).toBe("coding");
    expect(exerciseKind("PROBLEM_SOLVING")).toBe("coding");
    expect(exerciseKind("PREDICT_OUTPUT")).toBe("prediction");
    expect(exerciseKind("PSEUDOCODE")).toBe("blocks");
    expect(exerciseKind("FLOWCHART")).toBe("blocks");
  });
});
