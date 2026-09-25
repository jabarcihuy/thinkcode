import type { GradeResult, GradingExercise, GradingTest, VisibleTestResult } from "@/features/practice/types";
import type { SubmissionInput } from "@/features/practice/validation/submission";
import { normalizeOutput } from "@/features/practice/domain/normalize-output";
import type { Json } from "@/types/database";

export class GradingConfigurationError extends Error {}

function answerConfig(config: Json): Record<string, Json | undefined> {
  if (!config || typeof config !== "object" || Array.isArray(config)) throw new GradingConfigurationError("Invalid exercise config");
  const answer = config.answer;
  if (!answer || typeof answer !== "object" || Array.isArray(answer)) throw new GradingConfigurationError("Missing exercise answer");
  return answer;
}

function simpleResult(passed: boolean, correct: string, retry: string): GradeResult {
  return { passed, score: passed ? 100 : 0, feedback: passed ? correct : retry, visibleTests: [], hiddenPassed: 0, hiddenTotal: 0 };
}

function gradePredict(exercise: GradingExercise, submission: SubmissionInput): GradeResult {
  const expected = answerConfig(exercise.config).output;
  if (typeof expected !== "string" || !submission.answer || !("output" in submission.answer)) throw new GradingConfigurationError("Invalid predict output exercise");
  return simpleResult(normalizeOutput(submission.answer.output) === normalizeOutput(expected),
    "Prediksi output tepat.", "Output belum tepat. Periksa urutan baris dan nilai yang dicetak.");
}

function gradeBlocks(exercise: GradingExercise, submission: SubmissionInput): GradeResult {
  const expected = answerConfig(exercise.config);
  const answer = submission.answer;
  let passed = false;
  if (answer && "choiceId" in answer && typeof expected.choiceId === "string") passed = answer.choiceId === expected.choiceId;
  const expectedOrder = expected.order;
  if (answer && "order" in answer && Array.isArray(expectedOrder)) {
    passed = answer.order.length === expectedOrder.length && answer.order.every((id, index) => id === expectedOrder[index]);
  }
  return simpleResult(passed, "Urutan langkah tepat.", "Urutan atau pilihan belum tepat. Tinjau kembali langkah dari awal hingga akhir.");
}

function visibleResult(test: GradingTest, status: VisibleTestResult["status"], stdout: string, detail: string, passed: boolean): VisibleTestResult {
  return { position: test.position, passed, status, actualOutput: stdout, expectedOutput: test.expectedOutput, detail };
}

export function gradeCoding(exercise: GradingExercise, submission: SubmissionInput): GradeResult {
  if (exercise.tests.length === 0 || exercise.tests.length > 8 || exercise.tests.some((test) => test.weight <= 0 || test.isHidden)) {
    throw new GradingConfigurationError("Invalid coding test configuration");
  }
  const tests = [...exercise.tests].sort((a, b) => a.position - b.position);
  const results = submission.runResults ?? [];
  if (results.length !== tests.length || new Set(results.map((item) => item.position)).size !== tests.length) throw new GradingConfigurationError("Missing browser test results");
  const totalWeight = tests.reduce((sum, test) => sum + test.weight, 0);
  const visibleTests: VisibleTestResult[] = [];
  let earnedWeight = 0;
  let passedCount = 0;
  for (const test of tests) {
    const run = results.find((item) => item.position === test.position);
    if (!run) throw new GradingConfigurationError("Missing browser test result");
    const passed = run.status === "success" && normalizeOutput(run.stdout) === normalizeOutput(test.expectedOutput);
    if (passed) { earnedWeight += test.weight; passedCount++; }
    visibleTests.push(visibleResult(test, run.status, run.stdout, run.stderr, passed));
  }

  const passed = passedCount === tests.length;
  const score = Math.round((earnedWeight / totalWeight) * 100);
  const feedback = passed ? `${passedCount} dari ${tests.length} test terlihat berhasil.`
    : results.some((run) => run.status === "syntax_error") ? "Periksa sintaks JavaScript dan jalankan ulang."
      : results.some((run) => run.status === "timeout") ? "Eksekusi melewati batas waktu. Periksa loop yang tidak berhenti."
        : `${passedCount} dari ${tests.length} test terlihat berhasil. Periksa kembali input yang belum tertangani.`;
  return { passed, score, feedback, visibleTests, hiddenPassed: 0, hiddenTotal: 0 };
}

export function gradeExercise(exercise: GradingExercise, submission: SubmissionInput): GradeResult {
  if (exercise.type === "PREDICT_OUTPUT") return gradePredict(exercise, submission);
  if (exercise.type === "PSEUDOCODE" || exercise.type === "FLOWCHART") return gradeBlocks(exercise, submission);
  if (!submission.sourceCode) throw new GradingConfigurationError("Missing source code");
  return gradeCoding(exercise, submission);
}
