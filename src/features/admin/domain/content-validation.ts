import { z } from "zod";

const slug = z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const position = z.number().int().min(1).max(10_000);

export const pathInput = z.object({
  title: z.string().trim().min(1).max(160), slug,
  description: z.string().trim().max(2_000).default(""),
  position,
  is_published: z.boolean().default(false),
});
export const chapterInput = z.object({
  learning_path_id: z.uuid(), title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2_000).default(""), position,
  is_required: z.boolean().default(true), is_published: z.boolean().default(false),
});
export const lessonInput = z.object({
  chapter_id: z.uuid(), title: z.string().trim().min(1).max(160), slug,
  summary: z.string().trim().max(1_000).default(""), content: z.string().trim().min(1).max(30_000),
  example_source_code: z.string().max(16_000).nullable().default(null), position,
  is_required: z.boolean().default(true), is_preview: z.boolean().default(false), is_published: z.boolean().default(false),
});
const exerciseType = z.enum(["CODE_COMPLETION", "PREDICT_OUTPUT", "DEBUGGING", "PROBLEM_SOLVING", "PSEUDOCODE", "FLOWCHART"]);
const config = z.record(z.string(), z.unknown()).default({});
export const exerciseInput = z.object({
  lesson_id: z.uuid(), type: exerciseType, title: z.string().trim().min(1).max(160),
  prompt: z.string().trim().min(1).max(8_000), starter_code: z.string().max(16_000).nullable().default(null),
  solution_code: z.string().max(16_000).nullable().default(null), config,
  public_config: config.nullable().default(null), position, is_required: z.boolean().default(true),
  is_published: z.boolean().default(false),
}).superRefine((value, context) => {
  if (["CODE_COMPLETION", "DEBUGGING", "PROBLEM_SOLVING"].includes(value.type) && !value.starter_code?.trim()) {
    context.addIssue({ code: "custom", path: ["starter_code"], message: "Jenis latihan kode memerlukan starter code." });
  }
  if (value.type === "PREDICT_OUTPUT") {
    const answer = value.config.answer;
    if (!answer || typeof answer !== "object" || Array.isArray(answer) || typeof (answer as Record<string, unknown>).output !== "string") {
      context.addIssue({ code: "custom", path: ["config", "answer", "output"], message: "Predict Output memerlukan config.answer.output." });
    }
  }
  if (["PSEUDOCODE", "FLOWCHART"].includes(value.type)) {
    const publicConfig = value.public_config;
    const items = publicConfig?.mode === "order" ? publicConfig.blocks : publicConfig?.mode === "choice" ? publicConfig.options : null;
    if (!Array.isArray(items) || items.length < 2 || items.some((item) => !item || typeof item !== "object" || Array.isArray(item) || typeof item.id !== "string" || typeof item.text !== "string")) {
      context.addIssue({ code: "custom", path: ["public_config"], message: "Block practice memerlukan mode order/choice dengan minimal dua item id/text." });
    }
    const answer = value.config.answer;
    const privateAnswer = answer && typeof answer === "object" && !Array.isArray(answer) ? answer as Record<string, unknown> : null;
    if (!privateAnswer || (value.public_config?.mode === "order" ? !Array.isArray(privateAnswer.order) : typeof privateAnswer.choiceId !== "string")) {
      context.addIssue({ code: "custom", path: ["config", "answer"], message: "Tambahkan expected order/choiceId di private config.answer." });
    }
  }
});
export const testCaseInput = z.object({
  exercise_id: z.uuid(), stdin: z.string().max(4_000).default(""),
  expected_output: z.string().max(8_000).default(""), is_hidden: z.boolean().default(false),
  weight: z.number().positive().max(100), position,
});
export const assessmentTestCaseInput = z.object({
  assessment_item_id: z.uuid(), args: z.array(z.unknown()).max(20).default([]), stdin: z.string().max(4_000).default(""),
  expected_output: z.string().max(8_000), is_hidden: z.boolean().default(true),
  weight: z.number().positive().max(100), position,
});
export const assessmentInput = z.object({
  learning_path_id: z.uuid(), title: z.string().trim().min(1).max(160), slug,
  type: z.enum(["CHECKPOINT", "FINAL"]), instructions: z.string().trim().max(4_000).default(""),
  passing_score: z.number().min(0).max(100), gate_after_chapter: z.number().int().min(1).max(10),
  position, is_published: z.boolean().default(false),
});
export const assessmentItemInput = z.object({
  assessment_id: z.uuid(), type: exerciseType, title: z.string().trim().min(1).max(160),
  topic: z.string().trim().min(1).max(120), prompt: z.string().trim().min(1).max(8_000),
  starter_code: z.string().max(16_000).nullable().default(null), public_config: config.default({}),
  answer_config: config.default({}), entry_function: z.string().max(100).nullable().default(null),
  weight: z.number().positive().max(100), position,
});
