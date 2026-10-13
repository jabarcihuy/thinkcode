"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { requireAccount } from "@/lib/auth/session";
import { uploadProfilePhoto } from "./server/cloudinary";
import { appearanceSchema, readAppearance, type ProfileAppearance } from "./domain/appearance";
import { displayNameSchema } from "@/features/profile/validation/profile";

export interface ProfileActionState {
  error?: string;
  success?: string;
  appearance?: ProfileAppearance;
}

export async function updateDisplayNameAction(_: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const parsed = displayNameSchema.safeParse(formData.get("display_name"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Nama tampilan tidak valid." };

  const appearance = appearanceSchema.safeParse({ avatar: formData.get("avatar"), color: formData.get("color"), bio: formData.get("bio") });
  if (!appearance.success) return { error: "Pilihan profil tidak valid." };
  const account = await requireAccount();
  const supabase = await createClient();
  const verified = await supabase.auth.getUser();
  if (verified.error || verified.data.user?.id !== account.userId) return { error: "Sesi tidak valid. Masuk kembali untuk menyimpan profil." };
  let photo = readAppearance(verified.data.user.user_metadata?.quethink_profile).photo;
  const photoData = formData.get("photo_data");
  if (typeof photoData === "string" && photoData) {
    try { photo = await uploadProfilePhoto(account.userId, photoData); }
    catch (cause) { return { error: cause instanceof Error ? cause.message : "Foto belum dapat diunggah. Coba lagi." }; }
  } else if (formData.get("remove_photo") === "true") photo = null;
  const savedAppearance = { ...appearance.data, ...(photo ? { photo } : {}) };
  // Only this verified account's display_name is writable; role and owner never come from the form.
  const { data, error } = await createPrivilegedClient().from("profiles")
    .update({ display_name: parsed.data })
    .eq("id", account.userId)
    .select("id")
    .maybeSingle();

  if (error || !data) return { error: "Nama profil belum tersimpan. Coba lagi." };

  const { error: appearanceError } = await supabase.auth.updateUser({ data: { quethink_profile: savedAppearance } });
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  if (appearanceError) return { error: "Nama tersimpan, tetapi avatar dan bio belum tersimpan. Coba simpan lagi." };
  return { success: "Profil berhasil diperbarui.", appearance: savedAppearance };
}
