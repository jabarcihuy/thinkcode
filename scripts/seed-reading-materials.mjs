import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
const materials = JSON.parse(await readFile(new URL("./data/reading-materials.json", import.meta.url), "utf8"));
assert.equal(new Set(materials.map((item) => item.slug)).size, 11);
assert.ok(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY, "Supabase server credentials are required.");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: path, error: pathError } = await db.from("learning_paths").select("id").eq("slug", "database-fundamentals").single();
assert.ifError(pathError);
const { data: chapters, error: chapterError } = await db.from("chapters").select("id").eq("learning_path_id", path.id);
assert.ifError(chapterError);
const { data: lessons, error } = await db.from("lessons").select("id,slug,content,summary").in("chapter_id", chapters.map((item) => item.id)).in("slug", materials.map((item) => item.slug));
assert.ifError(error);
assert.equal(lessons.length, materials.length, "All 11 existing materials must be present; this seed does not create or delete lessons.");
for (const material of materials) {
  assert.ok(material.content.length > 1000 && material.content.length <= 30000 && !material.content.includes("submateri"));
  const lesson = lessons.find((item) => item.slug === material.slug);
  if (lesson.content !== material.content || lesson.summary !== material.summary) {
    const saved = await db.from("lessons").update({ content: material.content, summary: material.summary }).eq("id", lesson.id).eq("content", lesson.content).eq("summary", lesson.summary).select("id").single();
    assert.ifError(saved.error);
  }
  const verified = await db.from("lessons").select("content,summary").eq("id", lesson.id).single();
  assert.ifError(verified.error);
  assert.equal(verified.data.content, material.content);
  assert.equal(verified.data.summary, material.summary);
  console.log(`Verified reading material: ${material.slug}`);
}
console.log("11 reading materials updated. Existing IDs, exercises, scores and progress preserved.");
