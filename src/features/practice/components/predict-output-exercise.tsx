"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { PublicExercise } from "@/features/practice/types";
import { PracticeFeedback } from "@/features/practice/components/practice-feedback";
import { useExerciseCheck } from "@/features/practice/components/use-exercise-check";

export function PredictOutputExercise({ exercise, pathSlug }: { exercise: PublicExercise; pathSlug: string }) {
  const [output, setOutput] = useState("");
  const checkState = useExerciseCheck(exercise.id, pathSlug);
  return <section aria-label={exercise.title} className="border-t border-border py-8">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-primary">Predict Output{exercise.isRequired ? " · Wajib" : " · Opsional"}</p><h3 className="mt-2 text-xl font-bold tracking-tight">{exercise.title}</h3></div>{exercise.passed && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">Lulus</span>}</div>
    <p className="mt-4 leading-7 text-muted-foreground">{exercise.prompt}</p>
    <div className="mt-5 grid gap-6 md:grid-cols-2"><pre aria-label="Kode JavaScript, hanya baca" className="overflow-x-auto rounded-lg bg-code-surface p-5 font-mono text-sm leading-6 text-code-foreground">{exercise.starterCode}</pre><div><label htmlFor={`output-${exercise.id}`} className="text-sm font-semibold">Output yang kamu prediksi</label><textarea id={`output-${exercise.id}`} value={output} onChange={(event) => setOutput(event.target.value)} maxLength={4000} rows={6} className="mt-2 w-full rounded-md border border-input bg-background p-3 font-mono text-sm focus-visible:outline-2 focus-visible:outline-ring" /><Button type="button" className="mt-3" disabled={checkState.pending} onClick={() => checkState.check({ answer: { output } })}>Check Answer</Button></div></div>
    <div className="mt-5"><PracticeFeedback {...checkState} /></div>
  </section>;
}
