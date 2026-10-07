import {
  authorizeGuest,
  guestFailure,
  GuestError,
} from "@/features/guest/server/session";
import { guestMaterial } from "@/features/guest/server/catalog";
import { createMaterialPdf } from "@/features/learning/server/material-pdf";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await authorizeGuest();
    const { slug } = await params;
    const lesson = await guestMaterial(slug);
    if (!lesson) throw new GuestError(404, "Materi tidak ditemukan.");
    const bytes = await createMaterialPdf({
      number: lesson.number,
      title: lesson.title,
      summary: lesson.summary,
      content: lesson.content,
    });
    return new Response(Buffer.from(bytes), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="materi-${lesson.number}.pdf"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    return guestFailure(error);
  }
}
