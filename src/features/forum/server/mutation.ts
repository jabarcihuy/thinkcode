import "server-only";
import { rejectCrossOrigin } from "@/features/guest/server/session";
import { readLimitedJson } from "@/features/workspace/server/read-json";
import { ForumError, forumViewer } from "./access";
import { GuestError } from "@/features/guest/server/session";
export async function forumMutation(request: Request) {
  rejectCrossOrigin(request);
  const viewer = await forumViewer();
  if (!viewer.userId) throw new ForumError(401, "Masuk untuk berdiskusi.");
  let payload: unknown;
  try { payload = await readLimitedJson(request, 28_000); } catch { throw new ForumError(400, "Isi diskusi belum valid."); }
  return { userId: viewer.userId, role: viewer.role, payload };
}
export function checkForumWrite(error: { code?: string; message: string } | null) {
  if (!error) return;
  if (error.code === "P0001" && error.message === "Forum quota exceeded") throw new ForumError(429, "Terlalu banyak kiriman. Coba lagi nanti.");
  if (error.code === "42501") throw new ForumError(403, "Diskusi belum dapat dikirim. Topik mungkin ditutup atau tantangan masih aktif.");
  throw new ForumError(503, "Diskusi belum tersimpan. Coba lagi.");
}
export function forumFailure(error: unknown) {
  const known = error instanceof ForumError || error instanceof GuestError;
  return Response.json({ error: known ? error.message : "Forum belum dapat dimuat. Coba lagi." }, { status: known ? error.status : 503, headers: { "cache-control": "no-store" } });
}
