import { getAccessibleMaterial } from "@/features/learning/server/material-access";
import { createMaterialPdf } from "@/features/learning/server/material-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ pathSlug: string; lessonSlug: string }> }) {
  const { pathSlug, lessonSlug } = await params;
  try {
    const access = await getAccessibleMaterial(pathSlug, lessonSlug);
    if (!access) return Response.json({ message: "Materi belum tersedia untuk diunduh." }, { status: 404 });
    const { lesson, material, index } = access;
    const bytes = await createMaterialPdf({ number: index + 1, title: lesson.title, summary: lesson.summary, content: material.content });
    return new Response(Buffer.from(bytes), { headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quethink-materi-${index + 1}-${lesson.slug}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch {
    return Response.json({ message: "PDF belum bisa disiapkan. Silakan coba lagi." }, { status: 503 });
  }
}
