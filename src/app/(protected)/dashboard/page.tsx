import { localizeMetadata } from "@/i18n/metadata";
import { DashboardView } from "@/features/learning/components/dashboard-view";
import type { Metadata } from "next";
import { requireAccount } from "@/lib/auth/session";
import { DEFAULT_LEARNING_PATH_SLUG } from "@/features/learning/config";
import { getLearningOverview } from "@/features/learning/data/learning-repository";
import { getAssessmentSummaries } from "@/features/assessment/data/assessment-repository";
import { nextLearningAction } from "@/features/learning/domain/next-action";

const pageMetadata: Metadata = { title: "Beranda" };
export default async function DashboardPage() {
  const { userId, profile } = await requireAccount();
  const [overview, tests] = await Promise.all([getLearningOverview(DEFAULT_LEARNING_PATH_SLUG, userId), getAssessmentSummaries(DEFAULT_LEARNING_PATH_SLUG, userId)]);
  const post = tests.find((test) => test.type === "FINAL");
  const active = tests.find((test) => test.activeSessionId);
  const action = overview ? nextLearningAction(overview, active?.activeSessionId ?? null, Boolean(post?.result?.passed)) : null;
  return <DashboardView displayName={profile.display_name} overview={overview} action={action} postPassed={Boolean(post?.result?.passed)} postAvailable={Boolean(post?.available)} />;
}

export async function generateMetadata() { return localizeMetadata(pageMetadata); }
