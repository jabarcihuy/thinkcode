"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAccount } from "@/lib/auth/session";
import { displayNameSchema } from "@/features/profile/validation/profile";

export interface ProfileActionState {
  error?: string;
  success?: string;
}

export async function updateDisplayNameAction(_: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const parsed = displayNameSchema.safeParse(formData.get("display_name"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Nama tampilan tidak valid." };

  const account = await requireAccount();
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles")
    .update({ display_name: parsed.data })
    .eq("id", account.userId)
    .select("id")
    .maybeSingle();

  if (error || !data) return { error: "Nama profil belum tersimpan. Coba lagi." };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: "Nama profil berhasil diperbarui." };
}
