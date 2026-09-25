import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function consumeCodeQuota(kind: "check" | "ai" | "assessment"): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("consume_code_request_quota", { p_kind: kind });
  if (error) throw error;
  return data === true;
}
