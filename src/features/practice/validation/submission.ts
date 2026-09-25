import { z } from "zod";
import { pathSlugSchema } from "@/features/learning/validation/routes";
import type { ClientTestResult, ExerciseType } from "@/features/practice/types";

const baseSchema = z.object({
  pathSlug: pathSlugSchema,
  sourceCode: z.string().max(16_000).optional(),
  answer: z.unknown().optional(),
  runResults: z.array(z.object({
    position: z.number().int().positive(),
    status: z.enum(["success", "syntax_error", "runtime_error", "timeout", "internal_error"]),
    stdout: z.string().max(8_000),
    stderr: z.string().max(1_000),
  }).strict()).max(8).optional(),
}).strict();

const outputAnswer = z.object({ output: z.string().max(4_000) }).strict();
const choiceAnswer = z.object({ choiceId: z.string().min(1).max(80) }).strict();
const orderAnswer = z.object({ order: z.array(z.string().min(1).max(80)).min(2).max(20) }).strict();

export type SubmissionInput = { pathSlug: string; sourceCode: string | null; answer: { output: string } | { choiceId: string } | { order: string[] } | null; runResults: ClientTestResult[] | null };

export function parseSubmission(type: ExerciseType, value: unknown): SubmissionInput | null {
  const base = baseSchema.safeParse(value);
  if (!base.success) return null;
  if (type === "CODE_COMPLETION" || type === "DEBUGGING" || type === "PROBLEM_SOLVING") {
    if (!base.data.sourceCode?.trim()) return null;
    if (!base.data.runResults?.length) return null;
    return { pathSlug: base.data.pathSlug, sourceCode: base.data.sourceCode, answer: null, runResults: base.data.runResults };
  }
  if (type === "PREDICT_OUTPUT") {
    const answer = outputAnswer.safeParse(base.data.answer);
    return answer.success ? { pathSlug: base.data.pathSlug, sourceCode: null, answer: answer.data, runResults: null } : null;
  }
  const choice = choiceAnswer.safeParse(base.data.answer);
  if (choice.success) return { pathSlug: base.data.pathSlug, sourceCode: null, answer: choice.data, runResults: null };
  const order = orderAnswer.safeParse(base.data.answer);
  if (order.success && new Set(order.data.order).size === order.data.order.length) {
    return { pathSlug: base.data.pathSlug, sourceCode: null, answer: order.data, runResults: null };
  }
  return null;
}
