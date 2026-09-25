import { CodingExercise } from "@/features/practice/components/coding-exercise";
import { PredictOutputExercise } from "@/features/practice/components/predict-output-exercise";
import { BlockExercise } from "@/features/practice/components/block-exercise";
import type { ExerciseType, PublicExercise } from "@/features/practice/types";

export function exerciseKind(type: ExerciseType): "coding" | "prediction" | "blocks" {
  switch (type) {
    case "CODE_COMPLETION":
    case "DEBUGGING":
    case "PROBLEM_SOLVING": return "coding";
    case "PREDICT_OUTPUT": return "prediction";
    case "PSEUDOCODE":
    case "FLOWCHART": return "blocks";
  }
}

export function ExerciseRenderer({ exercise, pathSlug }: { exercise: PublicExercise; pathSlug: string }) {
  const kind = exerciseKind(exercise.type);
  if (kind === "coding") return <CodingExercise exercise={exercise} pathSlug={pathSlug} />;
  if (kind === "prediction") return <PredictOutputExercise exercise={exercise} pathSlug={pathSlug} />;
  return <BlockExercise exercise={exercise} pathSlug={pathSlug} label={exercise.type === "FLOWCHART" ? "Flowchart sederhana" : "Pseudocode"} />;
}
