import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
assert.ok(url && key, "Supabase URL and publishable key are required.");

const guest = createClient(url, key, { auth: { persistSession: false } });
const { data: paths, error: pathError } = await guest
  .from("learning_paths")
  .select("id, slug")
  .eq("slug", "database-fundamentals");
assert.ifError(pathError);
assert.equal(paths.length, 1, "The published database learning path should be readable to guests.");

const { data: lessons, error: lessonError } = await guest
  .from("lessons")
  .select("id, slug, is_preview");
assert.ifError(lessonError);
assert.ok(lessons.length > 0 && lessons.every((lesson) => lesson.is_preview), "Guests must only read published preview lessons.");

const { data: progress, error: progressError } = await guest
  .from("lesson_progress")
  .select("lesson_id");
assert.ifError(progressError);
assert.equal(progress.length, 0, "Guests must not read progress.");

const { error: mutationError } = await guest.rpc("phase1_start_lesson", {
  p_lesson_id: "00000000-0000-0000-0000-000000000000",
});
assert.ok(mutationError, "Guests must not call progress mutations.");

console.log("Live Supabase RLS checks passed: path, previews, private progress, guest mutation.");
