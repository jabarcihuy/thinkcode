import { notFound, redirect } from "next/navigation";
import { requireAccount } from "@/lib/auth/session";
import { getAssessmentSession } from "@/features/assessment/data/assessment-repository";
import { AssessmentWorkspace } from "@/features/assessment/components/assessment-workspace";

export default async function AssessmentSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { userId } = await requireAccount();
  const { sessionId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) notFound();
  const session = await getAssessmentSession(sessionId, userId);
  if (!session) notFound();
  if (session.session.status === "COMPLETED") redirect(`/assessments/sessions/${sessionId}/result`);
  if (session.session.status !== "IN_PROGRESS") notFound();
  return <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
    <AssessmentWorkspace sessionId={sessionId} assessmentTitle={session.assessment.title} instructions={session.assessment.instructions}
      passingScore={session.assessment.passingScore} items={session.items} />
  </main>;
}
