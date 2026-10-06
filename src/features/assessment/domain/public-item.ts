import type { Json } from "@/types/database";
import { readSqlAssessmentConfig } from "../validation/sql-assessment";

/** Do not serialize arbitrary admin JSON. Hidden grading fields are always excluded. */
export function publicAssessmentConfig(value: Json): Json {
  const sql = readSqlAssessmentConfig(value);
  if (sql) return { ...sql };
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const list = (entries: Json | undefined): Json[] => Array.isArray(entries) ? entries.slice(0, 32).flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry) || typeof entry.id !== "string" || typeof entry.text !== "string") return [];
    return [{ id: entry.id, text: entry.text }];
  }) : [];
  if (value.mode === "choice") return { mode: "choice", options: list(value.options) };
  if (value.mode === "order") return { mode: "order", blocks: list(value.blocks) };
  return typeof value.sampleOutput === "string" ? { sampleOutput: value.sampleOutput } : {};
}
