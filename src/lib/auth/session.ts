import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { readAuthenticatedUserId } from "@/lib/auth/identity";
import { hasRole, parseRole } from "@/lib/authorization/roles";
import type { Profile, Role } from "@/types/auth";
import { cache } from "react";

export interface Account {
  userId: string;
  profile: Profile;
}

export const getCurrentAccount = cache(async (): Promise<Account | null> => {
  const supabase = await createClient();
  const userId = await readAuthenticatedUserId(supabase.auth);
  if (!userId) return null;
  const { data, error } = await supabase.from("profiles").select("id, role, display_name, created_at, updated_at").eq("id", userId).single();
  const role = parseRole(data?.role);
  if (error || !data || !role) return null;
  return { userId, profile: { ...data, role } };
});

export async function requireAccount(): Promise<Account> {
  const account = await getCurrentAccount();
  if (!account) redirect("/login");
  return account;
}

export async function requireRole(role: Role): Promise<Account> {
  const account = await requireAccount();
  if (!hasRole(account.profile.role, role)) redirect("/dashboard");
  return account;
}
