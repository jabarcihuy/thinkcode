import type { ExerciseType } from "@/features/practice/types";

export const exerciseTypeLabels: Record<ExerciseType, string> = {
  CODE_COMPLETION: "Menulis query SQL",
  PREDICT_OUTPUT: "Prediksi hasil query",
  DEBUGGING: "Memperbaiki query",
  PROBLEM_SOLVING: "Tantangan query",
  PSEUDOCODE: "Pilih konsep database",
  FLOWCHART: "Baca relasi tabel",
};

export function exerciseTypeLabel(type: ExerciseType): string {
  return exerciseTypeLabels[type];
}
