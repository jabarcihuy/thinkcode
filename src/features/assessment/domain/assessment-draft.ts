import { readSqlAssessmentConfig } from "../validation/sql-assessment";
import { z } from "zod";
import type { AssessmentAnswer, PublicAssessmentItem } from "../types";

const answerSchema = z.union([
  z.object({ sourceCode: z.string().max(16_000) }).strict(),
  z.object({ output: z.string().max(4_000) }).strict(),
  z.object({ choiceId: z.string().max(64) }).strict(),
  z.object({ order: z.array(z.string().min(1).max(64)).max(32) }).strict(),
]);
const draftSchema = z.object({
  answers: z.record(z.string(), answerSchema), activeIndex: z.number().int().min(0),
}).strict();
export type AssessmentDraft = z.infer<typeof draftSchema>;

function config(item: PublicAssessmentItem) {
  return item.publicConfig && typeof item.publicConfig === "object" && !Array.isArray(item.publicConfig) ? item.publicConfig : {};
}
function ids(value: unknown): string[] {
  return Array.isArray(value) ? value.flatMap((entry) => entry && typeof entry === "object" && "id" in entry && typeof entry.id === "string" ? [entry.id] : []) : [];
}
export function initialAssessmentDraft(items: PublicAssessmentItem[]): AssessmentDraft {
  return { activeIndex: 0, answers: Object.fromEntries(items.map((item): [string, AssessmentAnswer] => {
    if (readSqlAssessmentConfig(item.publicConfig) || ["CODE_COMPLETION", "DEBUGGING", "PROBLEM_SOLVING"].includes(item.type)) return [item.id, { sourceCode: item.starterCode ?? "" }];
    if (item.type === "PREDICT_OUTPUT") return [item.id, { output: "" }];
    return config(item).mode === "choice" ? [item.id, { choiceId: "" }] : [item.id, { order: ids(config(item).blocks) }];
  })) };
}
export function readAssessmentDraft(value: unknown, items: PublicAssessmentItem[]): AssessmentDraft | null {
  const parsed = draftSchema.safeParse(value);
  if (!parsed.success || items.length > 16 || parsed.data.activeIndex >= items.length || Object.keys(parsed.data.answers).length !== items.length) return null;
  const initial = initialAssessmentDraft(items);
  for (const item of items) {
    const answer = parsed.data.answers[item.id], expected = initial.answers[item.id];
    if (!answer || !expected || Object.keys(answer)[0] !== Object.keys(expected)[0]) return null;
    if (readSqlAssessmentConfig(item.publicConfig) && "sourceCode" in answer && answer.sourceCode.length > 4096) return null;
    if ("choiceId" in answer && answer.choiceId && !ids(config(item).options).includes(answer.choiceId)) return null;
    if ("order" in answer) {
      const allowed = ids(config(item).blocks);
      if (answer.order.length !== allowed.length || new Set(answer.order).size !== allowed.length || answer.order.some((id) => !allowed.includes(id))) return null;
    }
  }
  return parsed.data;
}

export function assessmentDraftSignature(items: PublicAssessmentItem[]): string {
  // Exact public-content comparison invalidates a draft if an admin changes a question.
  return JSON.stringify(items.map(({ id, type, prompt, starterCode, publicConfig }) => ({ id, type, prompt, starterCode, publicConfig })));
}
