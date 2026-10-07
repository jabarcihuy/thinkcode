import { CourseTestView } from "./course-test-view";
import { requireAccount } from "@/lib/auth/session";
import { getAssessmentSummaries } from "../data/assessment-repository";
import { getLearningOverview } from "@/features/learning/data/learning-repository";
import { DEFAULT_LEARNING_PATH_SLUG } from "@/features/learning/config";
import { StartAssessmentButton } from "./start-assessment-button";

export async function CourseTestPage({ diagnostic }: { diagnostic: boolean }) {
  const { userId } = await requireAccount();
  const [tests, overview] = await Promise.all([
    getAssessmentSummaries(DEFAULT_LEARNING_PATH_SLUG, userId),
    getLearningOverview(DEFAULT_LEARNING_PATH_SLUG, userId),
  ]);
  const test = tests.find((entry) => entry.type === (diagnostic ? "PRETEST" : "FINAL"));
  const baseline = tests.find((entry) => entry.type === "PRETEST");
  const studied = overview?.lessons.some((lesson) => lesson.state === "COMPLETED" || lesson.state === "IN_PROGRESS");
  return <CourseTestView diagnostic={diagnostic} overview={overview} title={test?.title} result={test?.result ?? undefined} resultHref={test?.completedSessionId ? `/assessments/sessions/${test.completedSessionId}/result` : undefined} baselineScore={baseline?.result?.latestScore} available={Boolean(test?.available)} active={Boolean(test?.activeSessionId)} studied={Boolean(studied)} startAction={test && (test.available || test.activeSessionId) ? <StartAssessmentButton slug={test.slug} activeSessionId={test.activeSessionId} label={test.result ? "Ulangi tes akhir" : diagnostic ? "Mulai tes awal" : "Mulai tes akhir"} /> : null} />;
}
