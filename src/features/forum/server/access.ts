import "server-only";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { getCurrentAccount } from "@/lib/auth/session";
import { authorizeGuest } from "@/features/guest/server/session";
import type { ForumViewer } from "../types";
export class ForumError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function forumViewer(guest = false): Promise<ForumViewer> {
  if (guest) { await authorizeGuest(); return { userId: null, role: null, guest: true }; }
  const account = await getCurrentAccount();
  if (!account) throw new ForumError(401, "Masuk untuk berdiskusi.");
  const active = await createPrivilegedClient().from("assessment_sessions").select("id").eq("user_id", account.userId).eq("status", "IN_PROGRESS").limit(1);
  if (active.error) throw new ForumError(503, "Status tantangan belum dapat diperiksa.");
  if (active.data?.length) throw new ForumError(403, "Forum dijeda selama tantangan berlangsung. Selesaikan tantangan untuk kembali berdiskusi.");
  return { userId: account.userId, role: account.profile.role, guest: false };
}
