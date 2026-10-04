import type { AssessmentType } from "../types";

/** A baseline records starting understanding; only post-tests decide passing. */
export function testPolicy(type: AssessmentType) {
  const diagnostic = type === "PRETEST";
  return { diagnostic, canRetry: !diagnostic, countsForGrade: !diagnostic };
}

export function isTestAvailable(type: AssessmentType, readingComplete: boolean, baselineRecorded: boolean) {
  return type === "PRETEST" ? !baselineRecorded : readingComplete;
}

export function summarizeTopics(results: Array<{ topic: string; passed: boolean }>) {
  const topics = new Map<string, { topic: string; correct: number; total: number }>();
  for (const result of results) {
    const entry = topics.get(result.topic) ?? { topic: result.topic, correct: 0, total: 0 };
    entry.total++;
    if (result.passed) entry.correct++;
    topics.set(result.topic, entry);
  }
  return [...topics.values()];
}
