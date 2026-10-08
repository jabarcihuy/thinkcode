import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { replyInput, topicId } from "@/features/forum/validation/input";
import { forumMutation, checkForumWrite, forumFailure } from "@/features/forum/server/mutation";
import { ForumError } from "@/features/forum/server/access";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, payload } = await forumMutation(request);
    const id = topicId.safeParse((await params).id), input = replyInput.safeParse(payload);
    if (!id.success || !input.success) throw new ForumError(400, "Isi balasan minimal 2 karakter. Periksa kembali balasanmu.");
    const { data, error } = await createPrivilegedClient().rpc("forum_create_reply", { p_user_id: userId, p_topic_id: id.data, p_body: input.data.body });
    checkForumWrite(error);
    return Response.json({ id: data }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) { return forumFailure(error); }
}
