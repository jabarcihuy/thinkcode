"use server";

import { redirect } from "next/navigation";
import { getPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

export interface AuthFormState {
  error?: string;
  success?: string;
}

function formCredentials(formData: FormData) {
  return { email: formData.get("email"), password: formData.get("password") };
}

export async function loginAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse(formCredentials(formData));
  if (!parsed.success) return { error: "Isi email dan password yang valid." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Login gagal. Periksa email, password, dan status konfirmasi akun." };
  redirect("/dashboard");
}

export async function registerAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse(formCredentials(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data pendaftaran tidak valid." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: new URL("/auth/confirm", getPublicEnv().NEXT_PUBLIC_SITE_URL).toString() },
  });
  if (error) return { error: "Pendaftaran gagal. Coba lagi atau gunakan alamat email lain." };
  if (!data.session) return { success: "Periksa email Anda untuk mengonfirmasi akun, lalu login." };
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
