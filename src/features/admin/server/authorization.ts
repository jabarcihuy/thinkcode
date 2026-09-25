import "server-only";
import { createClient } from "@/lib/supabase/server";
import { readAuthenticatedUserId } from "@/lib/auth/identity";

export class AdminAuthorizationError extends Error {
  constructor(readonly status: 401 | 403) { super(status === 401 ? "Authentication required." : "Administrator access required."); }
}

export async function authorizeAdmin() {
  const client = await createClient();
  const userId = await readAuthenticatedUserId(client.auth);
  if (!userId) throw new AdminAuthorizationError(401);
  const { data, error } = await client.from("profiles").select("role").eq("id", userId).single();
  if (error || data?.role !== "ADMIN") throw new AdminAuthorizationError(403);
  return userId;
}
