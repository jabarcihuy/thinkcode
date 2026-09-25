import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { AssessmentAuthError, authenticateAssessmentUser } from "@/features/assessment/server/authenticate";

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { client } = await authenticateAssessmentUser();
    const { slug } = await params;
    const admin = createPrivilegedClient();
    const { data: path } = await admin.from("learning_paths").select("id").eq("slug", "programming-logic-fundamentals").maybeSingle();
    if (!path) return Response.json({ error: "Assessment tidak tersedia." }, { status: 404 });
    const { data: assessment, error } = await admin.from("assessments").select("id, is_published")
      .eq("slug", slug).eq("learning_path_id", path.id).maybeSingle();
    if (error || !assessment?.is_published) return Response.json({ error: "Assessment tidak tersedia." }, { status: 404 });
    const { data: sessionId, error: startError } = await client.rpc("start_assessment_session", { p_assessment_id: assessment.id });
    if (startError || !sessionId) return Response.json({ error: "Selesaikan prasyarat yang tampil sebelum memulai assessment." }, { status: 403 });
    return Response.json({ sessionId }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof AssessmentAuthError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "Assessment belum dapat dimulai." }, { status: 503 });
  }
}
