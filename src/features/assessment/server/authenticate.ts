import "server-only";
import { createClient } from "@/lib/supabase/server";

export class AssessmentAuthError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function authenticateAssessmentUser() {
  const client = await createClient();
  const { data, error } = await client.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || !userId) throw new AssessmentAuthError(401, "Masuk untuk mengikuti assessment.");
  return { client, userId };
}
