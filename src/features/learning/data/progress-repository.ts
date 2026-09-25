import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function persistLessonStart(lessonId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("phase1_start_lesson", { p_lesson_id: lessonId });
  if (error) throw error;
}
