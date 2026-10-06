"use client";

import { ScenarioWorkspace } from "@/features/schema-builder/components/schema-builder";
import { MODELING_SCENARIOS } from "@/features/schema-builder/data/scenarios";
import { Button } from "@/components/ui/button";
import { useExerciseCheck } from "./use-exercise-check";
import { PracticeFeedback } from "./practice-feedback";
import type { PublicExercise } from "../types";
import { QuestionPrompt } from "@/components/content/question-prompt";

export function SchemaExercise({ exercise, pathSlug, userId, reviewHref, previewOnly = false }: { exercise: PublicExercise; pathSlug: string; userId?: string; reviewHref?: string; previewOnly?: boolean }) {
  const { check, pending, result, error } = useExerciseCheck(exercise.id, pathSlug, previewOnly, reviewHref);
  return <section id={`practice-${exercise.id}`} className="mt-7 scroll-mt-24 rounded-lg border border-border bg-white p-4 sm:p-6" aria-labelledby={`title-${exercise.id}`}>
    <h3 id={`title-${exercise.id}`} className="text-xl font-semibold">{exercise.title}</h3>
    <p className="mt-2 text-sm text-accent">{exercise.passed ? "Latihan inti · lulus" : "Latihan inti · susun skema"}</p>
    <QuestionPrompt content={exercise.prompt} />
    <ScenarioWorkspace scenario={MODELING_SCENARIOS[0]!} storageKey={`${previewOnly ? "preview" : userId ?? "anonymous"}-core-${exercise.id}`} renderCheck={(draft) => <div><h4 className="text-lg font-semibold">Periksa struktur</h4><p className="mt-2 text-sm leading-6 text-muted-foreground">Nama tabel, kolom, PK, dan hubungan diperiksa di server. Kamu boleh mencoba lagi.</p><Button type="button" className="mt-4 w-full sm:w-auto" disabled={pending || previewOnly || !draft.tables.length} onClick={() => check({ answer: { schema: draft } })}>{pending ? "Memeriksa…" : "Periksa model"}</Button><PracticeFeedback reviewHref={reviewHref} pending={pending} result={result} error={error} /></div>} />
  </section>;
}
