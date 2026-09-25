import { z } from "zod";
import { AssessmentAuthError, authenticateAssessmentUser } from "@/features/assessment/server/authenticate";
import { getAssessmentSession } from "@/features/assessment/data/assessment-repository";

const sessionIdSchema = z.uuid();

export async function GET(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { userId } = await authenticateAssessmentUser();
    const { sessionId } = await params;
    if (!sessionIdSchema.safeParse(sessionId).success) return Response.json({ error: "Assessment tidak ditemukan." }, { status: 404 });
    const data = await getAssessmentSession(sessionId, userId);
    if (!data) return Response.json({ error: "Assessment tidak ditemukan." }, { status: 404 });
    return Response.json(data, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof AssessmentAuthError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "Assessment belum dapat dimuat." }, { status: 503 });
  }
}
