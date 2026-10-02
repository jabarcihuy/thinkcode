"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { PublicExercise } from "@/features/practice/types";
import { PracticeFeedback } from "@/features/practice/components/practice-feedback";
import { useExerciseCheck } from "@/features/practice/components/use-exercise-check";
import { exerciseDatasetId } from "@/features/database/data/datasets";
import { ExerciseDataCanvas } from "@/features/database/components/exercise-data-canvas";

export function PredictOutputExercise({ exercise, pathSlug, previewOnly = false }: { exercise: PublicExercise; pathSlug: string; previewOnly?: boolean }) {
  const config = exercise.publicConfig;
  const columns = config && typeof config === "object" && !Array.isArray(config) && Array.isArray(config.columns) ? config.columns.filter((value): value is string => typeof value === "string") : [];
  const [output, setOutput] = useState("");
  const checkState = useExerciseCheck(exercise.id, pathSlug, previewOnly);
  return <section id={`practice-${exercise.id}`} aria-label={exercise.title} className="scroll-mt-24 border-t border-border py-8">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-xl font-semibold tracking-tight">{exercise.title}</h3><p className="mt-1.5 text-xs text-muted-foreground">Prediksi hasil query{exercise.isRequired ? " · Wajib" : " · Opsional"}</p></div>{exercise.passed && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">Lulus</span>}</div>
    <ExerciseDataCanvas datasetId={exerciseDatasetId(exercise.publicConfig)} query={exercise.starterCode ?? ""} />
    <p className="mt-5 leading-7 text-muted-foreground">{exercise.prompt}</p>
    <div className="mt-6 border-t border-border pt-5">
      <h4 className="text-sm font-semibold">Query</h4>
      <pre aria-label="Query SQL, hanya baca" className="mt-3 overflow-x-auto rounded-lg bg-code-surface p-5 font-mono text-sm leading-6 text-code-foreground">{exercise.starterCode}</pre>
    </div>
    <div className="mt-6 border-t border-border pt-5">
      <label htmlFor={`output-${exercise.id}`} className="text-sm font-semibold">Hasil tabel yang kamu prediksi</label>
      {columns.length > 0 && <p className="mt-2 font-mono text-xs text-muted-foreground">Urutan kolom: {columns.join(" | ")}</p>}
      <textarea id={`output-${exercise.id}`} value={output} onChange={(event) => setOutput(event.target.value)} maxLength={4000} rows={6} placeholder={columns.length ? columns.join(" | ") : "Satu baris hasil per baris teks"} className="mt-2 w-full rounded-md border border-input bg-background p-3 font-mono text-base focus-visible:outline-2 focus-visible:outline-ring sm:text-sm" />
      <p className="mt-2 text-xs leading-5 text-muted-foreground">Satu baris per hasil, tanpa header; pisahkan kolom dengan |. Spasi di sekitar | dan nol desimal tambahan tidak memengaruhi nilai.</p>
      <Button type="button" className="mt-3" disabled={previewOnly || checkState.pending} onClick={() => checkState.check({ answer: { output } })}>{previewOnly ? "Pemeriksaan nonaktif di pratinjau" : "Periksa jawaban"}</Button>
    </div>
    <div className="mt-5"><PracticeFeedback {...checkState} /></div>
  </section>;
}
