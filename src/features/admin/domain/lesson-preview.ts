import type { Json, Tables } from "@/types/database";
import type { PublicExercise } from "@/features/practice/types";

type ExercisePreviewRow = Pick<Tables<"exercises">, "id" | "lesson_id" | "type" | "title" | "prompt" | "starter_code" | "public_config" | "position" | "is_required">;
function displayConfig(value: Json | null): Json | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const result: Record<string, Json | undefined> = {};
  for (const key of ["mode", "datasetId", "subtopic"]) if (typeof value[key] === "string") result[key] = value[key];
  if (Array.isArray(value.columns)) result.columns = value.columns.filter((column) => typeof column === "string");
  for (const key of ["blocks", "options"]) if (Array.isArray(value[key])) result[key] = value[key].flatMap((item) => item && typeof item === "object" && !Array.isArray(item) && typeof item.id === "string" && typeof item.text === "string" ? [{ id: item.id, text: item.text }] : []);
  return result;
}
/** Deliberately copies display fields only; privileged answers and test cases never enter this view. */
export function toPreviewExercise(row: ExercisePreviewRow): PublicExercise {
  return { id: row.id, lessonId: row.lesson_id, type: row.type, title: row.title, prompt: row.prompt, starterCode: row.starter_code, publicConfig: displayConfig(row.public_config), position: row.position, isRequired: row.is_required, passed: false, visibleTests: [] };
}
