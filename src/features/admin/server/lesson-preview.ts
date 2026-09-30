import "server-only";
import { z } from "zod";
import { authorizeAdmin } from "./authorization";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { toPreviewExercise } from "../domain/lesson-preview";

/** Preview authorizes an administrator independently of learner progress and publication status. */
export async function getAdminLessonPreview(lessonId: string) {
  await authorizeAdmin();
  if (!z.uuid().safeParse(lessonId).success) return null;
  const client = createPrivilegedClient();
  const [{ data: lesson, error: lessonError }, { data: exercises, error: exercisesError }] = await Promise.all([
    client.from("lessons").select("id, chapter_id, slug, title, summary, content, example_sql, is_published").eq("id", lessonId).maybeSingle(),
    client.from("exercises").select("id, lesson_id, type, title, prompt, starter_code, public_config, position, is_required").eq("lesson_id", lessonId).order("position"),
  ]);
  if (lessonError || exercisesError) throw new Error("Pratinjau materi belum dapat dimuat.");
  if (!lesson) return null;
  const { data: chapter, error: chapterError } = await client.from("chapters").select("id, title, learning_path_id").eq("id", lesson.chapter_id).single();
  if (chapterError) throw new Error("Chapter belum dapat dimuat.");
  const [{ data: path, error: pathError }, { data: navigation, error: navigationError }] = await Promise.all([
    client.from("learning_paths").select("id, slug, title").eq("id", chapter.learning_path_id).single(),
    client.from("lessons").select("id, title, is_published").eq("chapter_id", chapter.id).order("position"),
  ]);
  if (pathError || navigationError) throw new Error("Navigasi pratinjau belum dapat dimuat.");
  return { lesson, chapter, path, navigation: navigation ?? [], exercises: (exercises ?? []).map(toPreviewExercise) };
}
