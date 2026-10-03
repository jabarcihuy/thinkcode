import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const videos = JSON.parse(await readFile(new URL("./data/database-videos.json", import.meta.url), "utf8"));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
assert.ok(url && secret, "Supabase URL and server secret are required.");
const client = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: path, error: pathError } = await client.from("learning_paths").select("id").eq("slug", "database-fundamentals").single();
assert.ifError(pathError);
const { data: chapters, error: chapterError } = await client.from("chapters").select("id").eq("learning_path_id", path.id);
assert.ifError(chapterError);
const { data: lessons, error } = await client.from("lessons").select("id, slug, content").in("chapter_id", chapters.map((chapter) => chapter.id)).in("slug", videos.map((video) => video.slug));
assert.ifError(error);
assert.equal(lessons.length, videos.length, "All curated video target lessons must exist.");
for (const video of videos) {
  const lesson = lessons.find((item) => item.slug === video.slug);
  const block = `\n\n## Video pendamping (opsional)\n\n[${video.label}](https://www.youtube.com/watch?v=${video.id})\n\n${video.note}\n\n${video.reflection}\n`;
  if (!lesson.content.includes(`watch?v=${video.id}`)) {
    const saved = await client.from("lessons").update({ content: lesson.content + block }).eq("id", lesson.id).eq("content", lesson.content).select("id").single();
    assert.ifError(saved.error);
  }
  const verified = await client.from("lessons").select("content").eq("id", lesson.id).single();
  assert.ifError(verified.error);
  assert.ok(verified.data.content.includes(`watch?v=${video.id}`));
  console.log(`Verified supporting video: ${video.slug}`);
}
console.log("Video content seeded and read back. No schema, progress, practice, or assessment changes.");
