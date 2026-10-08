import { z } from "zod";
export const topicInput = z.object({ title: z.string().trim().min(6).max(140), body: z.string().trim().min(10).max(6000), category: z.enum(["DATABASE", "GENERAL"]) }).strict();
export const replyInput = z.object({ body: z.string().trim().min(2).max(4000) }).strict();
export const moderationInput = z.object({ targetId: z.uuid(), action: z.enum(["lock_topic", "hide_topic", "hide_reply"]), value: z.boolean() }).strict();
export const topicId = z.uuid();
export function forumPage(value: string | undefined): number {
  const parsed = z.coerce.number().int().min(1).max(10_000).safeParse(value ?? 1);
  return parsed.success ? parsed.data : 1;
}
