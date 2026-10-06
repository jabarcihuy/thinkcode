import { z } from "zod";
import { getDataset } from "@/features/database/data/datasets";
import { inspectSqlStatement } from "@/features/database/domain/sql-query";
import { questionDataSchema } from "@/features/database/validation/question-data";

export const sqlAssessmentPublicSchema = z.object({
  mode: z.literal("sql"), datasetId: z.enum(["campus", "library", "shop"]),
  operation: z.enum(["SELECT", "INSERT", "UPDATE", "DELETE"]),
  table: z.string().regex(/^[a-z_]+$/).optional(),
  data: questionDataSchema.optional(),
}).strict().superRefine((value, ctx) => {
  const dataset = getDataset(value.datasetId);
  if (value.data && value.data.datasetId !== value.datasetId) ctx.addIssue({ code: "custom", message: "Data soal dan runtime harus memakai dataset yang sama." });
  if ((value.operation !== "SELECT" || value.table !== undefined) && !dataset.tables.some((table) => table.name === value.table)) {
    ctx.addIssue({ code: "custom", message: "Pilih tabel mutasi pada dataset soal." });
  }
});
export type SqlAssessmentConfig = z.infer<typeof sqlAssessmentPublicSchema>;
export function readSqlAssessmentConfig(value: unknown): SqlAssessmentConfig | null {
  const parsed = sqlAssessmentPublicSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
export function validateAssessmentQuery(query: string, config: SqlAssessmentConfig) {
  const statement = inspectSqlStatement(query, getDataset(config.datasetId));
  if (config.operation === "SELECT" ? statement.kind !== "select"
    : statement.kind !== "mutation" || statement.action !== config.operation || statement.table !== config.table) {
    throw new Error("Query harus sesuai operasi pada soal.");
  }
  return statement;
}
