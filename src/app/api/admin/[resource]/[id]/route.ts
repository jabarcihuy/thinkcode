import { NextResponse } from "next/server";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { AdminAuthorizationError, authorizeAdmin } from "@/features/admin/server/authorization";
import { assessmentInput, assessmentItemInput, assessmentTestCaseInput, chapterInput, exerciseInput, lessonInput, pathInput, testCaseInput } from "@/features/admin/domain/content-validation";

const config = {
  paths: { table: "learning_paths", schema: pathInput },
  chapters: { table: "chapters", schema: chapterInput },
  lessons: { table: "lessons", schema: lessonInput },
  exercises: { table: "exercises", schema: exerciseInput },
  "test-cases": { table: "test_cases", schema: testCaseInput },
  assessments: { table: "assessments", schema: assessmentInput },
  "assessment-items": { table: "assessment_items", schema: assessmentItemInput },
  "assessment-test-cases": { table: "assessment_test_cases", schema: assessmentTestCaseInput },
} as const;
type Resource = keyof typeof config;

export async function PATCH(request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  try {
    await authorizeAdmin();
    const { resource, id } = await context.params;
    if (!(resource in config)) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });
    const item = config[resource as Resource];
    const body = await request.json() as { action?: string; position?: number; data?: unknown };
    const client = createPrivilegedClient();
    if (body.action === "publish" || body.action === "unpublish") {
      if (!["paths", "chapters", "lessons", "exercises", "assessments"].includes(resource)) return NextResponse.json({ error: "This item has no publication state." }, { status: 422 });
      const publish = body.action === "publish";
      if (publish && resource === "assessments") {
        const { data: items, error } = await client.from("assessment_items").select("id, title, type, entry_function").eq("assessment_id", id);
        if (error) throw error;
        if (!items?.length) return NextResponse.json({ error: "Add at least one assessment item before publishing." }, { status: 422 });
        for (const item of items ?? []) if (["CODE_COMPLETION", "DEBUGGING", "PROBLEM_SOLVING"].includes(item.type) && item.entry_function) {
          const { count: tests, error: testError } = await client.from("assessment_test_cases").select("id", { count: "exact", head: true }).eq("assessment_item_id", item.id);
          if (testError || !tests) return NextResponse.json({ error: `Add trusted server test cases to ${item.title} before publishing.` }, { status: 422 });
        }
      }
      if (publish && resource === "exercises") {
        const [{ data: exercise, error: exerciseError }, { count, error }] = await Promise.all([
          client.from("exercises").select("type").eq("id", id).single(),
          client.from("test_cases").select("id", { count: "exact", head: true }).eq("exercise_id", id),
        ]);
        if (exerciseError || error) throw exerciseError ?? error;
        if (["CODE_COMPLETION", "DEBUGGING", "PROBLEM_SOLVING"].includes(exercise.type)) {
          if (!count) return NextResponse.json({ error: "Add at least one test case before publishing this coding exercise." }, { status: 422 });
          const { count: hiddenCount, error: hiddenError } = await client.from("test_cases").select("id", { count: "exact", head: true }).eq("exercise_id", id).eq("is_hidden", true);
          if (hiddenError || hiddenCount) return NextResponse.json({ error: "Browser practice can only use visible tests. Store hidden grading cases in a server-graded assessment instead." }, { status: 422 });
        }
      }
      const { data, error } = await client.from(item.table as "learning_paths").update({ is_published: publish } as never).eq("id", id).select().single();
      if (error) throw error;
      return NextResponse.json({ item: data });
    }
    if (body.action === "reorder") {
      if (!Number.isInteger(body.position) || (body.position ?? 0) < 1 || (body.position ?? 0) > 10_000) return NextResponse.json({ error: "Position must be a positive whole number." }, { status: 422 });
      const { data, error } = await client.from(item.table as "learning_paths").update({ position: body.position } as never).eq("id", id).select().single();
      if (error) throw error;
      return NextResponse.json({ item: data });
    }
    const parsed = item.schema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ error: "Check the required fields and values.", details: parsed.error.flatten() }, { status: 422 });
    const dataToSave = { ...parsed.data } as Record<string, unknown>;
    if (resource === "exercises") {
      const exerciseData = parsed.data as Record<string, unknown>;
      const config = exerciseData.config as Record<string, unknown>;
      dataToSave.config = { ...config, public: exerciseData.public_config ?? {} };
      delete dataToSave.public_config;
    }
    if (resource !== "test-cases" && resource !== "assessment-items" && resource !== "assessment-test-cases") delete dataToSave.is_published;
    const { data, error } = await client.from(item.table as "learning_paths").update(dataToSave as never).eq("id", id).select().single();
    if (error) throw error;
    return NextResponse.json({ item: data });
  } catch (error) {
    if (error instanceof AdminAuthorizationError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Admin operation could not be completed." }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  try {
    await authorizeAdmin();
    const { resource, id } = await context.params;
    if (resource !== "test-cases" && resource !== "assessment-items" && resource !== "assessment-test-cases") return NextResponse.json({ error: "Content is unpublished instead of deleted." }, { status: 405 });
    const client = createPrivilegedClient();
    const table = resource === "test-cases" ? "test_cases" : resource === "assessment-test-cases" ? "assessment_test_cases" : "assessment_items";
    const { error } = await client.from(table).delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminAuthorizationError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Admin operation could not be completed." }, { status: 400 });
  }
}
