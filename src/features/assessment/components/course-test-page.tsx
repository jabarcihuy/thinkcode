

import { getText } from "@/i18n/server";
import { CourseTestView } from "./course-test-view";
import { requireAccount } from "@/lib/auth/session";
import { getAssessmentSummaries } from "../data/assessment-repository";
import { getLearningOverview } from "@/features/learning/data/learning-repository";
import { DEFAULT_LEARNING_PATH_SLUG } from "@/features/learning/config";
import { StartAssessmentButton } from "./start-assessment-button";

export async function CourseTestPage() {
  const tx = await getText();

  const { userId } = await requireAccount();
  const [tests, overview] = await Promise.all([
    getAssessmentSummaries(DEFAULT_LEARNING_PATH_SLUG, userId),
    getLearningOverview(DEFAULT_LEARNING_PATH_SLUG, userId),
  ]);
  const test = tests.find((entry) => entry.type === "FINAL");
  return <CourseTestView overview={overview} title={tx(test?.title)} result={test?.result ?? undefined} resultHref={test?.completedSessionId ? `/assessments/sessions/${test.completedSessionId}/result` : undefined} available={Boolean(test?.available)} active={Boolean(test?.activeSessionId)} startAction={test && (test.available || test.activeSessionId) ? <StartAssessmentButton slug={test.slug} activeSessionId={test.activeSessionId} label={tx(test.result ? "Ulangi tantangan akhir" : "Mulai tantangan akhir")} /> : null} />;
}
