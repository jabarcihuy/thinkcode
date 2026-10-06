import "server-only";
import { z } from "zod";
import { MAX_QUERY_LENGTH } from "@/features/database/domain/sql-query";

const cell = z.union([z.string().max(2000), z.number().finite(), z.null()]);
export const sqlAssessmentPrivateSchema = z.object({
  referenceQuery: z.string().min(1).max(MAX_QUERY_LENGTH), ordered: z.boolean(),
  fixtures: z.array(z.object({
    rows: z.record(z.string(), z.array(z.record(z.string(), cell)).max(50)).default({}),
    isHidden: z.boolean(),
  }).strict()).min(2).max(4),
}).strict().superRefine((value, ctx) => {
  if (value.fixtures[0]?.isHidden || Object.keys(value.fixtures[0]?.rows ?? {}).length || value.fixtures.slice(1).some((fixture) => !fixture.isHidden)) {
    ctx.addIssue({ code: "custom", message: "Kasus pertama memakai data awal publik; variasi berikutnya privat." });
  }
});
export type SqlAssessmentKey = z.infer<typeof sqlAssessmentPrivateSchema>;
