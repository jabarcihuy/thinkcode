import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { calculateLearningMetrics, deriveLessonStates, ownsProgress, type AssessmentGate } from "@/features/learning/domain/progression";
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

  const { data: chapters, error: chapterError } = await supabase
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
  let assessmentGates: AssessmentGate[] = [];
  if (userId && outlines.length > 0) {
    const [progressResult, assessmentResult] = await Promise.all([
      supabase.from("lesson_progress").select("lesson_id, status").eq("user_id", userId).in("lesson_id", outlines.map((lesson) => lesson.id)),
      createPrivilegedClient().from("assessments").select("id, gate_after_chapter").eq("learning_path_id", path.id).eq("type", "CHECKPOINT").eq("is_published", true),
    ]);
    if (progressResult.error) throw progressResult.error;
    if (assessmentResult.error) throw assessmentResult.error;
    progress = progressResult.data ?? [];
    const assessmentIds = (assessmentResult.data ?? []).map((assessment) => assessment.id);
    if (assessmentIds.length > 0) {
      const { data, error } = await createPrivilegedClient().from("assessment_results").select("assessment_id, passed")
        .eq("user_id", userId).in("assessment_id", assessmentIds);
      if (error) throw error;
      const passed = new Set((data ?? []).filter((result) => result.passed).map((result) => result.assessment_id));
      assessmentGates = (assessmentResult.data ?? []).map((assessment) => ({ gateAfterChapter: assessment.gate_after_chapter, passed: passed.has(assessment.id) }));
    }
  }

  const lessonsWithState = deriveLessonStates(outlines, progress, assessmentGates);
  return {
    path: path as LearningPath,
    chapters: chapterRows,
    lessons: lessonsWithState,
    metrics: calculateLearningMetrics(lessonsWithState),
  };
}

export const getLearningOverview = cache(loadOverview);

export async function getLessonMaterial(lessonId: string): Promise<{ content: string; exampleSourceCode: string | null } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("lessons").select("content, example_source_code").eq("id", lessonId).maybeSingle();
  if (error) throw error;
  return data ? { content: data.content, exampleSourceCode: data.example_source_code } : null;
}
