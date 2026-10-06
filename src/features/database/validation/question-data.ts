import { z } from "zod";
import { getDataset } from "../data/datasets";

/** References public synthetic seed tables only; never accepts arbitrary rows or answer keys. */
export const questionDataSchema = z.object({
  datasetId: z.enum(["campus", "library", "shop"]),
  tables: z.array(z.string()).min(1).max(4),
  relations: z.boolean().default(false),
}).strict().superRefine((value, context) => {
  const allowed = getDataset(value.datasetId).tables.map((table) => table.name);
  if (new Set(value.tables).size !== value.tables.length || value.tables.some((name) => !allowed.includes(name))) {
    context.addIssue({ code: "custom", message: "Gunakan tabel berbeda dari dataset sintetis yang dipilih." });
  }
});
export type QuestionData = z.infer<typeof questionDataSchema>;
export function readQuestionData(value: unknown): QuestionData | null {
  const parsed = questionDataSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
