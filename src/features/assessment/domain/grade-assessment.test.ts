import { describe, expect, it, vi } from "vitest";
import { gradeAssessment } from "./grade-assessment";
import type { AssessmentRunner } from "./assessment-runner";
import type { PrivateAssessmentItem } from "@/features/assessment/types";

function codingItem(id: string, testHidden: boolean): PrivateAssessmentItem {
  return {
    id, type: "PROBLEM_SOLVING", title: "Sum", topic: "Functions", prompt: "sum", starterCode: "", publicConfig: {},
    answerConfig: {}, entryFunction: "sum", weight: 1,
    tests: [{ args: [2, 3], stdin: "", expectedOutput: "5", isHidden: testHidden, weight: 1, position: 1 }],
    position: 1,
  };
}

describe("trusted assessment grading", () => {
  it("awards full score when all trusted tests pass", async () => {
    const runner: AssessmentRunner = { run: vi.fn(async () => ({ status: "success" as const, stdout: "", stderr: "", returnedValue: 5, executionTimeMs: 1, outputTruncated: false })) };
    const grade = await gradeAssessment([codingItem("item-1", false)], { answers: [{ itemId: "item-1", answer: { sourceCode: "function sum(a,b){return a+b}" } }] }, runner);
    expect(grade).toMatchObject({ score: 100, passed: true, totalCorrect: 1 });
    expect(grade.itemResults[0].visibleTests).toEqual([{ position: 1, passed: true }]);
  });

  it("does not disclose hidden test inputs or expected values", async () => {
    const runner: AssessmentRunner = { run: vi.fn(async () => ({ status: "success" as const, stdout: "4", stderr: "", returnedValue: 4, executionTimeMs: 1, outputTruncated: false })) };
    const grade = await gradeAssessment([codingItem("item-1", true)], { answers: [{ itemId: "item-1", answer: { sourceCode: "function sum(){return 4}" } }] }, runner);
    expect(grade.hiddenTotal).toBe(1);
    expect(JSON.stringify(grade)).not.toContain("expectedOutput");
    expect(JSON.stringify(grade)).not.toContain("args");
  });

  it("scores wrong answers, syntax errors, runtime errors and timeouts as failures", async () => {
    const runner: AssessmentRunner = { run: vi.fn(async () => ({ status: "timeout" as const, stdout: "", stderr: "Execution time limit exceeded.", returnedValue: undefined, executionTimeMs: 1500, outputTruncated: false })) };
    const timeout = await gradeAssessment([codingItem("item-1", false)], { answers: [{ itemId: "item-1", answer: { sourceCode: "while(true){}" } }] }, runner);
    expect(timeout.score).toBe(0);
    expect(timeout.passed).toBe(false);
    const wrong = await gradeAssessment([{ ...codingItem("p", false), type: "PREDICT_OUTPUT", answerConfig: { output: "6" } }], { answers: [{ itemId: "p", answer: { output: "5" } }] }, runner);
    expect(wrong.score).toBe(0);
  });

  it("uses weighted deterministic scoring", async () => {
    const runner: AssessmentRunner = { run: vi.fn() };
    const items: PrivateAssessmentItem[] = [
      { ...codingItem("p1", false), type: "PREDICT_OUTPUT", answerConfig: { output: "6" }, weight: 3 },
      { ...codingItem("p2", false), type: "PSEUDOCODE", answerConfig: { choiceId: "b" }, weight: 1, position: 2 },
    ];
    const grade = await gradeAssessment(items, { answers: [
      { itemId: "p1", answer: { output: "6" } }, { itemId: "p2", answer: { choiceId: "a" } },
    ] }, runner);
    expect(grade.score).toBe(75);
    expect(grade.passed).toBe(true);
  });
});
