import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

// Read-only coverage audit. Prints metadata, never answer keys or student data.
assert.ok(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY, "Supabase configuration required.");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const path = await db.from("learning_paths").select("id").eq("slug", "database-fundamentals").eq("is_published", true).single();
assert.ifError(path.error);
const chapters = await db.from("chapters").select("id, position").eq("learning_path_id", path.data.id).eq("is_published", true);
assert.ifError(chapters.error);
const positions = new Map(chapters.data.map((chapter) => [chapter.id, chapter.position]));
const lessons = await db.from("lessons").select("id, title, slug, position, chapter_id").in("chapter_id", [...positions.keys()]).eq("is_published", true);
assert.ifError(lessons.error);
const checks = await db.from("exercises").select("lesson_id, type, config, is_required").eq("is_published", true).in("lesson_id", lessons.data.map((lesson) => lesson.id));
assert.ifError(checks.error);
assert.equal(checks.data.filter((check) => check.is_required).length, 11, "Expected one core check per active material.");
const tests = await db.from("assessments").select("id, title, type").eq("learning_path_id", path.data.id).eq("is_published", true);
assert.ifError(tests.error);
const items = await db.from("assessment_items").select("assessment_id, topic, type, public_config").in("assessment_id", tests.data.map((test) => test.id));
assert.ifError(items.error);
console.log(JSON.stringify({
  materials: lessons.data.sort((a, b) => positions.get(a.chapter_id) - positions.get(b.chapter_id) || a.position - b.position).map((lesson) => ({
    slug: lesson.slug, coreEvidence: checks.data.filter((check) => check.lesson_id === lesson.id && check.is_required).map((check) => ({ type: check.type, mode: check.config?.public?.mode ?? "prediction" })),
  })),
  assessments: tests.data.map((test) => ({ title: test.title, type: test.type, items: items.data.filter((item) => item.assessment_id === test.id).map((item) => ({ topic: item.topic, type: item.type, mode: item.public_config?.mode ?? "prediction" })) })),
  independentSqlAuthoringGraded: items.data.some((item) => item.public_config?.mode === "sql"),
}, null, 2));
