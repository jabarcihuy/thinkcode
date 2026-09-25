import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url().refine((value) => value.startsWith("https://") || value.startsWith("http://localhost:"), "Use an HTTPS URL or localhost"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

export function getPublicEnv() {
  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  if (!result.success) {
    throw new Error("Supabase configuration is missing or invalid. Set the variables in .env.local.");
  }
  return result.data;
}

const aiEnvSchema = z.object({
  AI_API_URL: z.url().refine((value) => value.startsWith("https://"), "Use an HTTPS provider URL."),
  AI_API_KEY: z.string().min(1),
  AI_MODEL: z.string().min(1),
});

export function getAIEnv() {
  const result = aiEnvSchema.safeParse({
    AI_API_URL: process.env.AI_API_URL,
    AI_API_KEY: process.env.AI_API_KEY,
    AI_MODEL: process.env.AI_MODEL,
  });
  if (!result.success) throw new Error("AI Tutor is not configured. Set AI_API_URL, AI_API_KEY, and AI_MODEL on the server.");
  return result.data;
}
