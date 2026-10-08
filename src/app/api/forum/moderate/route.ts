import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { moderationInput } from "@/features/forum/validation/input";
import { forumMutation, checkForumWrite, forumFailure } from "@/features/forum/server/mutation";
import { ForumError } from "@/features/forum/server/access";
export async function POST(request: Request) {
  try {
    const { userId, role, payload } = await forumMutation(request);
    if (role !== "ADMIN") throw new ForumError(403, "Hanya admin yang dapat mengelola diskusi.");
    const input = moderationInput.safeParse(payload);
    if (!input.success) throw new ForumError(400, "Pengaturan diskusi belum valid.");
    const { error } = await createPrivilegedClient().rpc("forum_moderate", { p_user_id: userId, p_target_id: input.data.targetId, p_action: input.data.action, p_value: input.data.value });
    checkForumWrite(error);
    return Response.json({ saved: true }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return forumFailure(error); }
}
