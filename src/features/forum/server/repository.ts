import "server-only";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import type { ForumReply, ForumTopic, ForumViewer } from "../types";
const TOPICS = 20, REPLIES = 30;
async function authors(ids: string[]) {
  if (!ids.length) return new Map<string, string>();
  const { data, error } = await createPrivilegedClient().from("profiles").select("id, display_name").in("id", [...new Set(ids)]);
  if (error) throw error;
  return new Map((data ?? []).map(row => [row.id, row.display_name ?? "Pengguna"]));
}
export async function forumTopics(viewer: ForumViewer, page: number) {
  let query = createPrivilegedClient().from("forum_topics").select("id,title,category,author_id,is_locked,is_hidden,created_at", { count: "exact" });
  if (viewer.role !== "ADMIN") query = query.eq("is_hidden", false);
  const { data, error, count } = await query.order("created_at", { ascending: false }).order("id", { ascending: false }).range((page - 1) * TOPICS, page * TOPICS - 1);
  if (error) throw error;
  const names = await authors((data ?? []).map(row => row.author_id));
  return { items: (data ?? []).map(row => ({ id: row.id, title: row.title, body: "", category: row.category, createdAt: row.created_at, author: names.get(row.author_id) ?? "Pengguna", locked: row.is_locked, hidden: row.is_hidden } satisfies ForumTopic)), hasNext: page * TOPICS < (count ?? 0) };
}
export async function forumThread(viewer: ForumViewer, id: string, page: number) {
  let topicQuery = createPrivilegedClient().from("forum_topics").select("id,title,body,category,author_id,is_locked,is_hidden,created_at").eq("id", id);
  if (viewer.role !== "ADMIN") topicQuery = topicQuery.eq("is_hidden", false);
  const topic = await topicQuery.maybeSingle();
  if (topic.error) throw topic.error;
  if (!topic.data) return null;
  let replyQuery = createPrivilegedClient().from("forum_replies").select("id,body,author_id,is_hidden,created_at", { count: "exact" }).eq("topic_id", id);
  if (viewer.role !== "ADMIN") replyQuery = replyQuery.eq("is_hidden", false);
  const replies = await replyQuery.order("created_at").order("id").range((page - 1) * REPLIES, page * REPLIES - 1);
  if (replies.error) throw replies.error;
  const names = await authors([topic.data.author_id, ...(replies.data ?? []).map(row => row.author_id)]);
  const t = topic.data;
  return { topic: { id: t.id, title: t.title, body: t.body, category: t.category, createdAt: t.created_at, author: names.get(t.author_id) ?? "Pengguna", locked: t.is_locked, hidden: t.is_hidden } satisfies ForumTopic,
    replies: (replies.data ?? []).map(row => ({ id: row.id, body: row.body, createdAt: row.created_at, author: names.get(row.author_id) ?? "Pengguna", hidden: row.is_hidden } satisfies ForumReply)), hasNext: page * REPLIES < (replies.count ?? 0) };
}
