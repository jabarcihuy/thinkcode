import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import type { GradingExercise, PublicExercise, VisibleTest } from "@/features/practice/types";
import type { Json } from "@/types/database";

export async function getPublicExercises(lessonId: string, userId: string): Promise<PublicExercise[]> {
  const supabase = await createClient();
  const { data: catalog, error: catalogError } = await supabase
    .from("published_exercise_catalog")
    .select("id, lesson_id, type, title, prompt, starter_code, public_config, position, is_required")
    .eq("lesson_id", lessonId)
    .order("position");
  if (catalogError) throw catalogError;
  const rows = (catalog ?? []).filter((item) => item.id && item.lesson_id && item.type && item.title && item.prompt && item.position !== null);
  if (rows.length === 0) return [];
  const ids = rows.map((item) => item.id!);
  const [testsResult, attemptsResult] = await Promise.all([
    supabase.from("published_visible_test_cases").select("id, exercise_id, stdin, expected_output, position").in("exercise_id", ids),
    supabase.from("exercise_attempts").select("exercise_id, passed").eq("user_id", userId).eq("passed", true).in("exercise_id", ids),
  ]);
  if (testsResult.error) throw testsResult.error;
  if (attemptsResult.error) throw attemptsResult.error;
  const passed = new Set((attemptsResult.data ?? []).map((attempt) => attempt.exercise_id));
  const testsByExercise = new Map<string, VisibleTest[]>();
  for (const test of testsResult.data ?? []) {
    if (!test.exercise_id || !test.id || test.position === null) continue;
    const list = testsByExercise.get(test.exercise_id) ?? [];
    list.push({ id: test.id, stdin: test.stdin ?? "", expectedOutput: test.expected_output ?? "", position: test.position });
    testsByExercise.set(test.exercise_id, list);
  }
  return rows.map((row) => ({
    id: row.id!, lessonId: row.lesson_id!, type: row.type!, title: row.title!, prompt: row.prompt!,
    starterCode: row.starter_code, publicConfig: row.public_config, position: row.position!,
    isRequired: row.is_required ?? false, passed: passed.has(row.id!),
    visibleTests: (testsByExercise.get(row.id!) ?? []).sort((a, b) => a.position - b.position),
  }));
}

export async function getGradingExercise(exerciseId: string): Promise<GradingExercise | null> {
  const supabase = createPrivilegedClient();
  const { data: exercise, error } = await supabase.from("exercises")
    .select("id, lesson_id, type, config, is_published").eq("id", exerciseId).maybeSingle();
  if (error) throw error;
  if (!exercise?.is_published) return null;
  const { data: tests, error: testError } = await supabase.from("test_cases")
    .select("stdin, expected_output, is_hidden, weight, position")
    .eq("exercise_id", exerciseId).order("position");
  if (testError) throw testError;
  return {
    id: exercise.id, lessonId: exercise.lesson_id, type: exercise.type, config: exercise.config,
    tests: (tests ?? []).map((test) => ({
      stdin: test.stdin ?? "", expectedOutput: test.expected_output ?? "",
      isHidden: test.is_hidden, weight: test.weight, position: test.position,
    })),
  };
}

export async function recordGradedAttempt(input: {
  userId: string; exerciseId: string; sourceCode: string | null; answer: Json | null;
  score: number; passed: boolean; feedback: Json;
}): Promise<boolean> {
  const supabase = createPrivilegedClient();
  const { data, error } = await supabase.rpc("phase3_record_attempt", {
    p_user_id: input.userId, p_exercise_id: input.exerciseId, p_source_code: input.sourceCode ?? "",
    p_answer: input.answer, p_score: input.score, p_passed: input.passed, p_feedback: input.feedback,
  });
  if (error) throw error;
  return data === true;
}
