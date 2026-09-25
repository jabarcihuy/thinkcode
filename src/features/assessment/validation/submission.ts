import { z } from "zod";

const answerSchema = z.union([
  z.object({ sourceCode: z.string().max(16_000) }).strict(),
  z.object({ output: z.string().max(4_000) }).strict(),
  z.object({ choiceId: z.string().min(1).max(64) }).strict(),
  z.object({ order: z.array(z.string().min(1).max(64)).max(32) }).strict(),
]);

export const assessmentSubmissionSchema = z.object({
  answers: z.array(z.object({ itemId: z.uuid(), answer: answerSchema }).strict()).min(1).max(16),
}).strict().refine((value) => new Set(value.answers.map((answer) => answer.itemId)).size === value.answers.length, {
  message: "Each assessment item can be answered once.",
});

export type AssessmentSubmissionInput = z.infer<typeof assessmentSubmissionSchema>;
