import { describe, expect, it } from "vitest";
import type { GradingExercise } from "@/features/practice/types";
import type { SubmissionInput } from "@/features/practice/validation/submission";
import { gradeExercise, GradingConfigurationError } from "./grade-exercise";
import { normalizeOutput } from "./normalize-output";

const coding: GradingExercise = {
  id: "exercise", lessonId: "lesson", type: "CODE_COMPLETION", config: {},
  tests: [
    { stdin: "1", expectedOutput: "one", isHidden: false, weight: 1, position: 1 },
    { stdin: "2", expectedOutput: "two", isHidden: false, weight: 1, position: 2 },
  ],
};
const submission: SubmissionInput = { pathSlug: "path", sourceCode: "console.log(input)", answer: null, runResults: [
  { position: 1, status: "success", stdout: "one\n", stderr: "" },
  { position: 2, status: "success", stdout: "two", stderr: "" },
] };

describe("output normalization", () => {
  it("accepts CRLF, trailing whitespace, and a final newline", () => {
    expect(normalizeOutput("one  \r\ntwo\r\n")).toBe(normalizeOutput("one\ntwo"));
  });
  it("keeps meaningful interior whitespace", () => {
    expect(normalizeOutput("a b")).not.toBe(normalizeOutput("ab"));
  });
});

describe("browser coding results", () => {
  it("scores all visible tests", () => expect(gradeExercise(coding, submission)).toMatchObject({ passed: true, score: 100, hiddenTotal: 0 }));
  it("scores partial results", () => {
    const partial = { ...submission, runResults: [submission.runResults![0], { position: 2, status: "success" as const, stdout: "wrong", stderr: "" }] };
    expect(gradeExercise(coding, partial)).toMatchObject({ passed: false, score: 50 });
  });
  it.each(["syntax_error", "runtime_error", "timeout"] as const)("handles %s", (status) => {
    const failed = { ...submission, runResults: [{ position: 1, status, stdout: "", stderr: "error" }, submission.runResults![1]] };
    expect(gradeExercise(coding, failed).passed).toBe(false);
  });
  it("refuses hidden coding tests rather than shipping them to the browser", () => {
    const secret = { ...coding, tests: [{ ...coding.tests[0], isHidden: true }] };
    expect(() => gradeExercise(secret, submission)).toThrow(GradingConfigurationError);
  });
});

describe("deterministic answers", () => {
  it("checks predicted output", () => {
    const exercise: GradingExercise = { ...coding, type: "PREDICT_OUTPUT", config: { answer: { output: "Halo\nJavaScript" } }, tests: [] };
    expect(gradeExercise(exercise, { ...submission, sourceCode: null, runResults: null, answer: { output: "Halo\r\nJavaScript\n" } }).passed).toBe(true);
    expect(gradeExercise(exercise, { ...submission, sourceCode: null, runResults: null, answer: { output: "JavaScript\nHalo" } }).passed).toBe(false);
  });
  it("checks pseudocode and flowchart order", () => {
    for (const type of ["PSEUDOCODE", "FLOWCHART"] as const) {
      const exercise: GradingExercise = { ...coding, type, config: { answer: { order: ["start", "end"] } }, tests: [] };
      expect(gradeExercise(exercise, { ...submission, sourceCode: null, runResults: null, answer: { order: ["start", "end"] } }).passed).toBe(true);
    }
  });
  it("checks a missing flowchart node against private server configuration", () => {
    const exercise: GradingExercise = { ...coding, type: "FLOWCHART", config: { answer: { choiceId: "decision" } }, tests: [] };
    expect(gradeExercise(exercise, { ...submission, sourceCode: null, runResults: null, answer: { choiceId: "decision" } }).passed).toBe(true);
    expect(gradeExercise(exercise, { ...submission, sourceCode: null, runResults: null, answer: { choiceId: "end" } }).passed).toBe(false);
  });
});
