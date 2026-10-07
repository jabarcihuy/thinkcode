
import { useText } from "@/i18n/use-text";
import { SchemaExercise } from "./schema-exercise";
import { CodingExercise } from "@/features/practice/components/coding-exercise";
import { PredictOutputExercise } from "@/features/practice/components/predict-output-exercise";
import { BlockExercise } from "@/features/practice/components/block-exercise";
import type { ExerciseType, PublicExercise } from "@/features/practice/types";
import { exerciseTypeLabel } from "@/features/practice/domain/exercise-labels";

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

export function ExerciseRenderer({ exercise, pathSlug, userId, reviewHref, previewOnly = false }: { exercise: PublicExercise; pathSlug: string; userId?: string; reviewHref?: string; previewOnly?: boolean }) {
  const tx = useText();

  const config = exercise.publicConfig;
  if (config && typeof config === "object" && !Array.isArray(config) && config.mode === "schema") return <SchemaExercise exercise={exercise} reviewHref={reviewHref} userId={userId} pathSlug={pathSlug} previewOnly={previewOnly} />;
  const kind = exerciseKind(exercise.type);
  if (previewOnly && kind === "coding") return <p className="mt-6 text-sm text-muted-foreground">{tx("Latihan pemrograman lama tidak digunakan pada materi basis data.")}</p>;
  if (kind === "coding") return <CodingExercise exercise={exercise} pathSlug={pathSlug} />;
  if (kind === "prediction") return <PredictOutputExercise previewOnly={previewOnly} reviewHref={reviewHref} userId={userId} exercise={exercise} pathSlug={pathSlug} />;
  return <BlockExercise previewOnly={previewOnly} reviewHref={reviewHref} userId={userId} exercise={exercise} pathSlug={pathSlug} label={tx(exerciseTypeLabel(exercise.type))} />;
}
