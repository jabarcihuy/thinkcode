import { z } from "zod";

export const tutorActionSchema = z.enum([
  "message", "hint", "explain_concept", "explain_code", "why_wrong", "explain_error", "explain_trace", "similar_practice", "full_solution",
]);

export const tutorRequestSchema = z.object({
  lessonId: z.uuid(),
  exerciseId: z.uuid().optional(),
  sessionId: z.uuid().optional(),
  action: tutorActionSchema.default("message"),
  message: z.string().trim().max(1200).default(""),
  sourceCode: z.string().max(16_000).default(""),
  visibleOutput: z.string().max(4_000).default(""),
  visibleTestResults: z.array(z.object({ position: z.number().int().positive(), passed: z.boolean() })).max(8).default([]),
  traceSummary: z.string().max(4_000).default(""),
});
