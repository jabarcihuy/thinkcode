import { normalizeOutput } from "@/features/practice/domain/normalize-output";
import type { AssessmentRunner } from "@/features/assessment/domain/assessment-runner";
import type { AssessmentAnswer, AssessmentGrade, PrivateAssessmentItem } from "@/features/assessment/types";
import type { AssessmentSubmissionInput } from "@/features/assessment/validation/submission";
import type { Json } from "@/types/database";

function objectValue(value: Json): Record<string, Json | undefined> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

function formatReturnedValue(value: unknown): string {
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value;
  try { return JSON.stringify(value) ?? String(value); }
  catch { return String(value); }
}

function gradeDeterministic(item: PrivateAssessmentItem, answer: AssessmentAnswer): boolean {
  const expected = objectValue(item.answerConfig);
  if ("output" in answer) return typeof expected.output === "string" && normalizeOutput(answer.output) === normalizeOutput(expected.output);
  if ("choiceId" in answer) return typeof expected.choiceId === "string" && answer.choiceId === expected.choiceId;
  const expectedOrder = expected.order;
  if ("order" in answer && Array.isArray(expectedOrder)) {
    return answer.order.length === expectedOrder.length && answer.order.every((value, index) => value === expectedOrder[index]);
  }
  return false;
}

export async function gradeAssessment(
  items: PrivateAssessmentItem[],
  submission: AssessmentSubmissionInput,
  runner: AssessmentRunner,
  passingScore = 75,
): Promise<AssessmentGrade> {
  if (items.length === 0 || items.length > 16) throw new Error("Assessment configuration is invalid.");
  const answers = new Map(submission.answers.map((entry) => [entry.itemId, entry.answer]));
  if (answers.size !== items.length || items.some((item) => !answers.has(item.id))) throw new Error("Every assessment item must be answered.");
  const totalTests = items.reduce((sum, item) => sum + item.tests.length, 0);
  if (totalTests > 24 || items.some((item) => item.tests.length > 8)) throw new Error("Assessment has too many coding tests.");

  const itemResults = [];
  let earnedPoints = 0;
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  for (const item of [...items].sort((a, b) => a.position - b.position)) {
    const answer = answers.get(item.id)!;
    let itemScore = 0;
    let passedTests = 0;
    let totalItemTests = 0;
    let hiddenPassed = 0;
    let hiddenTotal = 0;
    const visibleTests: AssessmentGrade["itemResults"][number]["visibleTests"] = [];

    if (item.type === "PREDICT_OUTPUT" || item.type === "PSEUDOCODE" || item.type === "FLOWCHART") {
      itemScore = gradeDeterministic(item, answer) ? 100 : 0;
    } else if ("sourceCode" in answer && item.tests.length > 0) {
      const tests = [...item.tests].sort((a, b) => a.position - b.position);
      const totalTestWeight = tests.reduce((sum, test) => sum + test.weight, 0);
      let earnedTestWeight = 0;
      for (const test of tests) {
        const args = Array.isArray(test.args) ? test.args : [];
        const result = await runner.run({
          sourceCode: answer.sourceCode,
          stdin: test.stdin,
          timeoutMs: 1_500,
          entryFunction: item.entryFunction ?? undefined,
          args,
        });
        const actual = item.entryFunction ? formatReturnedValue(result.returnedValue) : result.stdout;
        const passed = result.status === "success" && normalizeOutput(actual) === normalizeOutput(test.expectedOutput);
        totalItemTests++;
        if (passed) { passedTests++; earnedTestWeight += test.weight; }
        if (test.isHidden) {
          hiddenTotal++;
          if (passed) hiddenPassed++;
        } else visibleTests.push({ position: test.position, passed });
      }
      itemScore = totalTestWeight === 0 ? 0 : Math.round((earnedTestWeight / totalTestWeight) * 100);
    }

    const passed = itemScore === 100;
    earnedPoints += item.weight * itemScore / 100;
    itemResults.push({ itemId: item.id, topic: item.topic, passed, score: itemScore, passedTests, totalTests: totalItemTests, hiddenPassed, hiddenTotal, visibleTests });
  }

  const score = Math.round(earnedPoints / totalWeight * 100);
  const totalCorrect = itemResults.filter((item) => item.passed).length;
  return {
    score,
    passed: score >= passingScore,
    totalCorrect,
    totalItems: items.length,
    hiddenPassed: itemResults.reduce((sum, item) => sum + item.hiddenPassed, 0),
    hiddenTotal: itemResults.reduce((sum, item) => sum + item.hiddenTotal, 0),
    itemResults,
    topicSummary: itemResults.map((item) => ({ topic: item.topic, passed: item.passed })),
  };
}
