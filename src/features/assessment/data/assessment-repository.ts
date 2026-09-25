import "server-only";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import type { PublicAssessmentItem } from "@/features/assessment/types";

export interface AssessmentSummary {
  id: string;
  slug: string;
  title: string;
  instructions: string;
  type: "CHECKPOINT" | "FINAL";
  gateAfterChapter: number;
  passingScore: number;
  position: number;
  available: boolean;
  activeSessionId: string | null;
  result: { attemptCount: number; latestScore: number; highestScore: number; passed: boolean } | null;
}

export async function getAssessmentSummaries(pathSlug: string, userId: string): Promise<AssessmentSummary[]> {
  const supabase = createPrivilegedClient();
  const { data: path, error: pathError } = await supabase.from("learning_paths").select("id").eq("slug", pathSlug).maybeSingle();
  if (pathError) throw pathError;
  if (!path) return [];
  const [{ data: assessments, error: assessmentsError }, { data: chapters, error: chaptersError }] = await Promise.all([
    supabase.from("assessments").select("id, slug, title, instructions, type, gate_after_chapter, passing_score, position")
      .eq("learning_path_id", path.id).eq("is_published", true).order("position"),
    supabase.from("chapters").select("id, position").eq("learning_path_id", path.id).eq("is_published", true),
  ]);
  if (assessmentsError) throw assessmentsError;
  if (chaptersError) throw chaptersError;
  const chapterPosition = new Map((chapters ?? []).map((chapter) => [chapter.id, chapter.position]));
  const chapterIds = [...chapterPosition.keys()];
  const { data: lessons, error: lessonError } = chapterIds.length
    ? await supabase.from("lessons").select("id, chapter_id").in("chapter_id", chapterIds).eq("is_published", true).eq("is_required", true)
    : { data: [], error: null };
  if (lessonError) throw lessonError;
  const lessonIds = (lessons ?? []).map((lesson) => lesson.id);
  const [progressResult, resultResult, activeResult] = await Promise.all([
    lessonIds.length ? supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId).eq("status", "COMPLETED").in("lesson_id", lessonIds) : Promise.resolve({ data: [], error: null }),
    (assessments ?? []).length ? supabase.from("assessment_results").select("assessment_id, attempt_count, latest_score, highest_score, passed").eq("user_id", userId).in("assessment_id", (assessments ?? []).map((item) => item.id)) : Promise.resolve({ data: [], error: null }),
    (assessments ?? []).length ? supabase.from("assessment_sessions").select("id, assessment_id").eq("user_id", userId).eq("status", "IN_PROGRESS").in("assessment_id", (assessments ?? []).map((item) => item.id)) : Promise.resolve({ data: [], error: null }),
  ]);
  if (progressResult.error) throw progressResult.error;
  if (resultResult.error) throw resultResult.error;
  if (activeResult.error) throw activeResult.error;
  const completedLessons = new Set((progressResult.data ?? []).map((item) => item.lesson_id));
  const results = new Map((resultResult.data ?? []).map((item) => [item.assessment_id, item]));
  const activeSessions = new Map((activeResult.data ?? []).map((item) => [item.assessment_id, item.id]));

  return (assessments ?? []).map((assessment) => {
    const required = (lessons ?? []).filter((lesson) => (chapterPosition.get(lesson.chapter_id) ?? 99) <= assessment.gate_after_chapter);
    const lessonsComplete = required.every((lesson) => completedLessons.has(lesson.id));
    const earlierCheckpoints = (assessments ?? []).filter((item) => item.type === "CHECKPOINT" && item.position < assessment.position);
    const checkpointsComplete = earlierCheckpoints.every((item) => results.get(item.id)?.passed === true);
    const allCheckpointsComplete = assessment.type !== "FINAL"
      || (assessments ?? []).filter((item) => item.type === "CHECKPOINT").every((item) => results.get(item.id)?.passed === true);
    const saved = results.get(assessment.id);
    return {
      id: assessment.id, slug: assessment.slug, title: assessment.title, instructions: assessment.instructions,
      type: assessment.type, gateAfterChapter: assessment.gate_after_chapter, passingScore: assessment.passing_score,
      position: assessment.position, available: lessonsComplete && checkpointsComplete && allCheckpointsComplete,
      activeSessionId: activeSessions.get(assessment.id) ?? null,
      result: saved ? { attemptCount: saved.attempt_count, latestScore: saved.latest_score, highestScore: saved.highest_score, passed: saved.passed } : null,
    };
  });
}

export interface AssessmentSessionData {
  session: { id: string; assessment_id: string; status: string; score: number | null; started_at: string };
  assessment: { title: string; instructions: string; passingScore: number; type: "CHECKPOINT" | "FINAL" };
  items: PublicAssessmentItem[];
}

export async function getAssessmentSession(sessionId: string, userId: string): Promise<AssessmentSessionData | null> {
  const supabase = createPrivilegedClient();
  const { data: session, error } = await supabase.from("assessment_sessions")
    .select("id, assessment_id, status, score, started_at")
    .eq("id", sessionId).eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!session) return null;
  const [{ data: assessment, error: assessmentError }, { data: items, error: itemsError }] = await Promise.all([
    supabase.from("assessments").select("title, instructions, passing_score, type").eq("id", session.assessment_id).maybeSingle(),
    supabase.from("assessment_items").select("id, type, title, topic, prompt, starter_code, public_config, position")
      .eq("assessment_id", session.assessment_id).order("position"),
  ]);
  if (assessmentError) throw assessmentError;
  if (itemsError) throw itemsError;
  if (!assessment) return null;
  return {
    session,
    assessment: { title: assessment.title, instructions: assessment.instructions, passingScore: assessment.passing_score, type: assessment.type },
    items: (items ?? []).map((item) => ({
      id: item.id, type: item.type, title: item.title, topic: item.topic, prompt: item.prompt,
      starterCode: item.starter_code, publicConfig: item.public_config, position: item.position,
    })) as PublicAssessmentItem[],
  };
}

export async function getAssessmentResult(sessionId: string, userId: string) {
  const supabase = createPrivilegedClient();
  const { data, error } = await supabase.from("assessment_sessions")
    .select("id, assessment_id, status, score, completed_at, safe_feedback")
    .eq("id", sessionId).eq("user_id", userId).eq("status", "COMPLETED").maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { data: assessment } = await supabase.from("assessments").select("title, passing_score").eq("id", data.assessment_id).maybeSingle();
  if (!assessment) return null;
  return { id: data.id, title: assessment.title, passingScore: assessment.passing_score, score: data.score ?? 0, completedAt: data.completed_at, safeFeedback: data.safe_feedback };
}
