import { revalidatePath } from "next/cache";
import { getCurrentAccount } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getLearningOverview } from "@/features/learning/data/learning-repository";
import { DEFAULT_LEARNING_PATH_SLUG } from "@/features/learning/config";
import { lessonIdSchema } from "@/features/learning/validation/routes";

export async function POST(_request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const account = await getCurrentAccount();
  if (!account) return Response.json({ error: "Masuk untuk menyimpan progres membaca." }, { status: 401 });
  const { lessonId } = await params;
  if (!lessonIdSchema.safeParse(lessonId).success) return Response.json({ error: "Materi tidak tersedia." }, { status: 404 });
  try {
    const overview = await getLearningOverview(DEFAULT_LEARNING_PATH_SLUG, account.userId);
    const lesson = overview?.lessons.find((item) => item.id === lessonId);
    if (!lesson || lesson.state === "LOCKED") return Response.json({ error: "Baca materi sebelumnya terlebih dahulu." }, { status: 403 });
    const db = await createClient();
    const { error } = await db.rpc("acknowledge_material_read", { p_lesson_id: lessonId });
    if (error) return Response.json({ error: "Progres belum dapat disimpan. Selesaikan tes aktif, lalu coba lagi." }, { status: 409 });
    revalidatePath(`/learn/${DEFAULT_LEARNING_PATH_SLUG}`);
    revalidatePath("/dashboard");
    revalidatePath("/post-test");
    return Response.json({ acknowledged: true }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Progres membaca belum tersimpan. Coba lagi." }, { status: 503 });
  }
}
