import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { topicInput } from "@/features/forum/validation/input";
import { forumMutation, checkForumWrite, forumFailure } from "@/features/forum/server/mutation";
import { ForumError } from "@/features/forum/server/access";
export async function POST(request: Request) {
  try {
    const { userId, payload } = await forumMutation(request);
    const input = topicInput.safeParse(payload);
    if (!input.success) throw new ForumError(400, "Judul minimal 6 karakter dan isi minimal 10 karakter. Periksa kembali diskusimu.");
    const { data: id, error } = await createPrivilegedClient().rpc("forum_create_topic", { p_user_id: userId, p_title: input.data.title, p_body: input.data.body, p_category: input.data.category });
    checkForumWrite(error);
    return Response.json({ id }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) { return forumFailure(error); }
}
