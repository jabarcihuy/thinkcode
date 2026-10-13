import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";
import { parseRole } from "@/lib/authorization/roles";
import type { Database } from "@/types/database";
import type { Role } from "@/types/auth";

export class MobileError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export type MobileActor = { db: SupabaseClient<Database>; userId: string; role: Role; displayName: string | null };
export function bearerToken(request: Request): string {
  const match = /^Bearer ([A-Za-z0-9._~-]{20,8192})$/i.exec(request.headers.get("authorization") ?? "");
  if (!match) throw new MobileError(401, "unauthorized", "Sign in to continue.");
  return match[1]!;
}
export async function authenticateMobile(request: Request): Promise<MobileActor> {
  const token = bearerToken(request);
  const env = getPublicEnv();
  const db = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data: identity, error: authError } = await db.auth.getUser(token);
  if (authError && (!authError.status || authError.status >= 500)) throw new MobileError(503, "unavailable", "Sign-in verification is temporarily unavailable. Try again.");
  if (authError || !identity.user) throw new MobileError(401, "unauthorized", "Your session has expired. Sign in again.");
  const { data, error } = await db.from("profiles").select("role,display_name").eq("id", identity.user.id).single();
  if (error) throw new MobileError(503, "unavailable", "Your account could not be loaded. Try again.");
  const role = parseRole(data?.role);
  if (!role) throw new MobileError(403, "forbidden", "Account access is unavailable.");
  return { db, userId: identity.user.id, role, displayName: data?.display_name ?? null };
}
