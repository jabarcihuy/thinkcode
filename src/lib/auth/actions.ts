"use server";

import { redirect } from "next/navigation";
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
  if (error) return { error: "Login gagal. Periksa kembali email dan password Anda." };
  redirect("/dashboard");
}

export async function registerAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse(formCredentials(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data pendaftaran tidak valid." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(parsed.data);
  if (error) return { error: "Pendaftaran gagal. Coba lagi atau gunakan alamat email lain." };
  if (!data.session) {
    return { error: "Pendaftaran langsung belum aktif. Minta pengelola menonaktifkan Confirm Email di pengaturan Supabase Auth." };
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
