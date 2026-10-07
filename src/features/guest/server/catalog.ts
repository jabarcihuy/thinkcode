import "server-only";
import { cache } from "react";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { publicAssessmentConfig } from "@/features/assessment/domain/public-item";
import type {
  PublicAssessmentItem,
  PrivateAssessmentItem,
} from "@/features/assessment/types";
import type { PublicExercise } from "@/features/practice/types";
export const guestCatalog = cache(async () => {
  const db = createPrivilegedClient();
  const { data: path, error } = await db
    .from("learning_paths")
    .select("id, title")
    .eq("slug", "database-fundamentals")
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  if (!path) return { lessons: [], tests: [] };
  const chapters = await db
    .from("chapters")
    .select("id, position")
    .eq("learning_path_id", path.id)
    .eq("is_published", true);
  if (chapters.error) throw chapters.error;
  const ids = (chapters.data ?? []).map((c) => c.id);
  const [lessons, tests] = await Promise.all([
    ids.length
      ? db
          .from("lessons")
          .select("id, slug, title, summary, chapter_id, position")
          .in("chapter_id", ids)
          .eq("is_published", true)
      : Promise.resolve({ data: [], error: null }),
    db
      .from("assessments")
      .select("id, title, type, instructions, passing_score, position")
      .eq("learning_path_id", path.id)
      .eq("is_published", true)
      .order("position"),
  ]);
  if (lessons.error || tests.error) throw lessons.error ?? tests.error;
  const positions = new Map(
    (chapters.data ?? []).map((c) => [c.id, c.position]),
  );
  return {
    lessons: (lessons.data ?? []).sort(
      (a, b) =>
        (positions.get(a.chapter_id) ?? 0) -
          (positions.get(b.chapter_id) ?? 0) || a.position - b.position,
    ),
    tests: tests.data ?? [],
  };
});
export async function guestMaterial(slug: string) {
  const catalog = await guestCatalog();
  const lesson = catalog.lessons.find((l) => l.slug === slug);
  if (!lesson) return null;
  const result = await createPrivilegedClient()
    .from("lessons")
    .select("content, example_sql")
    .eq("id", lesson.id)
    .eq("is_published", true)
    .single();
  if (result.error) throw result.error;
  return {
    ...lesson,
    content: result.data.content,
    exampleSql: result.data.example_sql,
    number: catalog.lessons.indexOf(lesson) + 1,
  };
}
export async function guestExercises(
  lessonId: string,
): Promise<PublicExercise[]> {
  const catalog = await guestCatalog();
  if (!catalog.lessons.some((l) => l.id === lessonId)) return [];
  const { data, error } = await createPrivilegedClient()
    .from("published_exercise_catalog")
    .select(
      "id, lesson_id, type, title, prompt, starter_code, public_config, position, is_required",
    )
    .eq("lesson_id", lessonId)
    .eq("is_required", true)
    .order("position");
  if (error) throw error;
  return (data ?? []).flatMap((r) =>
    r.id && r.lesson_id && r.title && r.prompt && r.type && r.position !== null
      ? [
          {
            id: r.id,
            lessonId: r.lesson_id,
            type: r.type,
            title: r.title,
            prompt: r.prompt,
            starterCode: r.starter_code,
            publicConfig: r.public_config,
            position: r.position,
            isRequired: r.is_required ?? false,
            passed: false,
            visibleTests: [],
          },
        ]
      : [],
  );
}
export async function guestTest(id: string) {
  const assessment = (await guestCatalog()).tests.find((t) => t.id === id);
  if (!assessment) return null;
  const { data, error } = await createPrivilegedClient()
    .from("assessment_items")
    .select(
      "id, type, title, topic, prompt, starter_code, public_config, position",
    )
    .eq("assessment_id", id)
    .order("position");
  if (error) throw error;
  const items: PublicAssessmentItem[] = (data ?? []).map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    topic: r.topic,
    prompt: r.prompt,
    starterCode: r.starter_code,
    publicConfig: publicAssessmentConfig(r.public_config),
    position: r.position,
  }));
  return { assessment, items };
}
export async function guestGradingItems(
  id: string,
  items: PublicAssessmentItem[],
): Promise<PrivateAssessmentItem[]> {
  const db = createPrivilegedClient();
  const [privateRows, tests] = await Promise.all([
    db
      .from("assessment_items")
      .select("id, answer_config, entry_function, weight")
      .eq("assessment_id", id),
    db
      .from("assessment_test_cases")
      .select(
        "assessment_item_id, args, stdin, expected_output, is_hidden, weight, position",
      )
      .in(
        "assessment_item_id",
        items.map((i) => i.id),
      )
      .order("position"),
  ]);
  if (privateRows.error || tests.error) throw privateRows.error ?? tests.error;
  return items.map((item) => {
    const privateItem = privateRows.data?.find((r) => r.id === item.id);
    if (!privateItem) throw new Error("Missing grading item");
    return {
      ...item,
      answerConfig: privateItem.answer_config,
      entryFunction: privateItem.entry_function,
      weight: privateItem.weight,
      tests: (tests.data ?? [])
        .filter((t) => t.assessment_item_id === item.id)
        .map((t) => ({
          args: t.args,
          stdin: t.stdin,
          expectedOutput: t.expected_output,
          isHidden: t.is_hidden,
          weight: t.weight,
          position: t.position,
        })),
    };
  });
}
