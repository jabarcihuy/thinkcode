import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { AdminAuthorizationError, authorizeAdmin } from "@/features/admin/server/authorization";
import { assessmentInput, assessmentItemInput, assessmentTestCaseInput, chapterInput, exerciseInput, lessonInput, pathInput, testCaseInput } from "@/features/admin/domain/content-validation";
import type { Json } from "@/types/database";

const resources = ["paths", "chapters", "lessons", "exercises", "test-cases", "assessments", "assessment-items", "assessment-test-cases"] as const;
type Resource = typeof resources[number];
const schemas = { paths: pathInput, chapters: chapterInput, lessons: lessonInput, exercises: exerciseInput, "test-cases": testCaseInput, assessments: assessmentInput, "assessment-items": assessmentItemInput, "assessment-test-cases": assessmentTestCaseInput };
const tableNames = { paths: "learning_paths", chapters: "chapters", lessons: "lessons", exercises: "exercises", "test-cases": "test_cases", assessments: "assessments", "assessment-items": "assessment_items", "assessment-test-cases": "assessment_test_cases" } as const;
type TableName = typeof tableNames[Resource];

function isResource(value: string): value is Resource { return (resources as readonly string[]).includes(value); }
function respondError(error: unknown) {
  if (error instanceof AdminAuthorizationError) return NextResponse.json({ error: error.message }, { status: error.status });
  return NextResponse.json({ error: "Admin operation could not be completed." }, { status: 400 });
}

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    await authorizeAdmin();
    const { resource: raw } = await context.params;
    if (raw === "users") {
      const client = createPrivilegedClient();
      const [{ data: users, error: usersError }, { data: profiles, error: profilesError }, { data: progress, error: progressError }] = await Promise.all([
        client.auth.admin.listUsers({ page: 1, perPage: 100 }),
        client.from("profiles").select("id, role, display_name, created_at"),
        client.from("lesson_progress").select("user_id, status"),
      ]);
      if (usersError || profilesError || progressError) throw new Error("Unable to load accounts");
      const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
      const completedByUser = new Map<string, number>();
      for (const entry of progress ?? []) if (entry.status === "COMPLETED") completedByUser.set(entry.user_id, (completedByUser.get(entry.user_id) ?? 0) + 1);
      return NextResponse.json({ items: users.users.map((user) => ({ id: user.id, email: user.email ?? "", created_at: user.created_at, display_name: profileById.get(user.id)?.display_name ?? null, role: profileById.get(user.id)?.role ?? "USER", completed_lessons: completedByUser.get(user.id) ?? 0 })) });
    }
    if (raw === "overview") {
      const client = createPrivilegedClient();
      const [users, paths, chapters, lessons, exercises, assessments] = await Promise.all([
        client.from("profiles").select("id", { count: "exact", head: true }),
        client.from("learning_paths").select("id, is_published"), client.from("chapters").select("id, is_published"),
        client.from("lessons").select("id, is_published"), client.from("exercises").select("id, is_published"),
        client.from("assessments").select("id, is_published"),
      ]);
      if ([paths, chapters, lessons, exercises, assessments].some((result) => result.error) || users.error) throw new Error("Unable to load overview");
      const groups = [paths.data ?? [], chapters.data ?? [], lessons.data ?? [], exercises.data ?? [], assessments.data ?? []];
      return NextResponse.json({ counts: { users: users.count ?? 0, paths: groups[0].length, chapters: groups[1].length, lessons: groups[2].length, exercises: groups[3].length, assessments: groups[4].length, published: groups.reduce((sum, rows) => sum + rows.filter((row) => row.is_published).length, 0), drafts: groups.reduce((sum, rows) => sum + rows.filter((row) => !row.is_published).length, 0) } });
    }
    if (!isResource(raw)) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });
    const client = createPrivilegedClient() as unknown as SupabaseClient;
    let query = client.from(tableNames[raw] as TableName).select("*");
    const url = new URL(request.url);
    const filterColumn = raw === "chapters" ? "learning_path_id" : raw === "lessons" ? "chapter_id" : raw === "exercises" ? "lesson_id" : raw === "test-cases" ? "exercise_id" : raw === "assessment-items" ? "assessment_id" : raw === "assessment-test-cases" ? "assessment_item_id" : null;
    const filterValue = url.searchParams.get("parentId");
    if (filterColumn && filterValue) query = query.eq(filterColumn, filterValue) as typeof query;
    const { data, error } = await query.order("position", { ascending: true });
    if (error) throw error;
    if (raw === "exercises") {
      const ids = (data ?? []).map((row) => row.id);
      const tests = ids.length ? await client.from("test_cases").select("*").in("exercise_id", ids).order("position") : { data: [], error: null };
      if (tests.error) throw tests.error;
      return NextResponse.json({ items: data ?? [], tests: tests.data ?? [] });
    }
    if (raw === "assessment-items") {
      const ids = (data ?? []).map((row) => row.id);
      const tests = ids.length ? await client.from("assessment_test_cases").select("*").in("assessment_item_id", ids).order("position") : { data: [], error: null };
      if (tests.error) throw tests.error;
      return NextResponse.json({ items: data ?? [], tests: tests.data ?? [] });
    }
    return NextResponse.json({ items: data ?? [] });
  } catch (error) { return respondError(error); }
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    await authorizeAdmin();
    const { resource: raw } = await context.params;
    if (!isResource(raw)) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });
    const parsed = schemas[raw].safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Check the required fields and values.", details: parsed.error.flatten() }, { status: 422 });
    const client = createPrivilegedClient() as unknown as SupabaseClient;
    const draft: Record<string, unknown> = { ...parsed.data, ...(raw !== "test-cases" && raw !== "assessment-items" && raw !== "assessment-test-cases" ? { is_published: false } : {}) };
    if (raw === "exercises") {
      const exerciseData = parsed.data as Record<string, unknown>;
      const config = exerciseData.config as Record<string, Json>;
      draft.config = { ...config, public: exerciseData.public_config ?? {} };
      delete draft.public_config;
    }
    const row = draft as Record<string, Json | undefined>;
    const { data, error } = await client.from(tableNames[raw] as TableName).insert(row).select().single();
    if (error) throw error;
    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) { return respondError(error); }
}
