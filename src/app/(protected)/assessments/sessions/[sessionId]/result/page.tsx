import { AssessmentResultView } from "@/features/assessment/components/assessment-result-view";
import { notFound } from "next/navigation";
import { requireAccount } from "@/lib/auth/session";
import { getAssessmentResult } from "@/features/assessment/data/assessment-repository";
import type { Json } from "@/types/database";

function feedbackObject(value: Json): Record<string, Json | undefined> {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export default async function AssessmentResultPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { userId } = await requireAccount();
  const { sessionId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) notFound();
  const result = await getAssessmentResult(sessionId, userId);
  if (!result) notFound();
  const safe = feedbackObject(result.safeFeedback);
  const topicSummary = Array.isArray(safe.topicSummary) ? safe.topicSummary.filter((item): item is { topic: string; passed: boolean } =>
    Boolean(item && typeof item === "object" && !Array.isArray(item) && typeof item.topic === "string" && typeof item.passed === "boolean")) : [];
  return <AssessmentResultView result={result} topicSummary={topicSummary} />;
}
