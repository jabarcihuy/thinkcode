import "server-only";
import { getText } from "@/i18n/server";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { calculateLearningMetrics, deriveLessonStates, ownsProgress } from "@/features/learning/domain/progression";
import type { Chapter, LearningOverview, LearningPath, LessonOutline, ProgressRecord } from "@/features/learning/types";

async function loadOverview(pathSlug: string, userId: string | null): Promise<LearningOverview | null> {
  const supabase = await createClient();
  if (userId) {
    const { data } = await supabase.auth.getClaims();
    if (!ownsProgress(data?.claims?.sub ?? null, userId)) throw new Error("Akses progres ditolak.");
  }
  const { data: path, error: pathError } = await supabase
    .from("learning_paths")
    .select("id, slug, title, description")
    .eq("slug", pathSlug)
    .maybeSingle();
  if (pathError) throw pathError;
  if (!path) return null;

  const { data: chapters, error: chapterError } = await
    supabase
    .from("chapters")
    .select("id, title, description, position, is_required")
    .eq("learning_path_id", path.id)
    .order("position");
  if (chapterError) throw chapterError;

  const chapterRows = (chapters ?? []) as Chapter[];
  const chapterById = new Map(chapterRows.map((chapter) => [chapter.id, chapter]));
  const chapterIds = chapterRows.map((chapter) => chapter.id);
  if (chapterIds.length === 0) {
    return { path: path as LearningPath, chapters: [], lessons: [], metrics: calculateLearningMetrics([]) };
  }

  const { data: lessons, error: lessonError } = await supabase
    .from("lessons")
    .select("id, chapter_id, slug, title, summary, position, is_required, is_preview")
    .in("chapter_id", chapterIds)
    .order("position");
  if (lessonError) throw lessonError;

  const outlines: LessonOutline[] = (lessons ?? []).flatMap((lesson) => {
    const chapter = chapterById.get(lesson.chapter_id);
    return chapter ? [{
      ...lesson,
      chapterPosition: chapter.position,
      chapterTitle: chapter.title,
      chapterIsRequired: chapter.is_required,
    }] : [];
  });

  let progress: ProgressRecord[] = [];
  if (userId && outlines.length > 0) {
    const result = await supabase.from("lesson_progress").select("lesson_id, status, read_at").eq("user_id", userId).in("lesson_id", outlines.map((lesson) => lesson.id));
    if (result.error) throw result.error;
    progress = result.data ?? [];
  }

  const baselineComplete = true; // Compatibility field; diagnostic prerequisite is retired.
  const lessonsWithState = deriveLessonStates(outlines, progress, [], baselineComplete);
  return {
    path: path as LearningPath,
    chapters: chapterRows,
    lessons: lessonsWithState,
    baselineComplete,
    metrics: calculateLearningMetrics(lessonsWithState),
  };
}

export const getLearningOverview = cache(loadOverview);

export async function getLessonMaterial(lessonId: string): Promise<{ content: string; exampleSql: string | null } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("lessons").select("content, example_sql").eq("id", lessonId).maybeSingle();
  if (error) throw error;
  const tx = await getText();
  return data ? { content: tx(data.content), exampleSql: data.example_sql } : null;
}
