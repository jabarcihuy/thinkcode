import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { AdminConsole } from "@/features/admin/components/admin-console";

export const metadata: Metadata = { title: "Admin CMS" };

export default async function AdminPage() {
  await requireRole("ADMIN");
  const client = createPrivilegedClient();
  const [{ count: users }, paths, chapters, lessons, exercises, assessments] = await Promise.all([
    client.from("profiles").select("id", { count: "exact", head: true }),
    client.from("learning_paths").select("id, is_published"),
    client.from("chapters").select("id, is_published"),
    client.from("lessons").select("id, is_published"),
    client.from("exercises").select("id, is_published"),
    client.from("assessments").select("id, is_published"),
  ]);
  const groups = [paths.data ?? [], chapters.data ?? [], lessons.data ?? [], exercises.data ?? [], assessments.data ?? []];
  const counts = {
    users: users ?? 0, paths: groups[0].length, chapters: groups[1].length, lessons: groups[2].length,
    exercises: groups[3].length, assessments: groups[4].length,
    published: groups.reduce((count, rows) => count + rows.filter((row) => row.is_published).length, 0),
    drafts: groups.reduce((count, rows) => count + rows.filter((row) => !row.is_published).length, 0),
  };
  return <AdminConsole initialCounts={counts} />;
}
