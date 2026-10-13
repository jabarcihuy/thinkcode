import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { readAppearance } from "../domain/appearance";
export const getPersonalization = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { appearance: readAppearance(data.user.user_metadata.quethink_profile), email: data.user.email ?? "" };
});
