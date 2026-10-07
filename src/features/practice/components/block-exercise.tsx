"use client";

import { useText } from "@/i18n/use-text";


import { DraftStatus } from "@/components/forms/draft-status";
import { usePracticeDraft } from "./use-practice-draft";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicExercise } from "@/features/practice/types";
import { PracticeFeedback } from "@/features/practice/components/practice-feedback";
import { useExerciseCheck } from "@/features/practice/components/use-exercise-check";
import { exerciseDatasetId } from "@/features/database/data/datasets";
import { ExerciseDataCanvas } from "@/features/database/components/exercise-data-canvas";
import type { Json } from "@/types/database";
import { QuestionPrompt } from "@/components/content/question-prompt";
import { QuestionDataView } from "@/components/content/question-data";
import { readQuestionData } from "@/features/database/validation/question-data";

type Block = { id: string; text: string };
type BlockConfig = { mode: "order"; blocks: Block[] } | { mode: "choice"; options: Block[] };

function parseBlockConfig(value: Json | null): BlockConfig | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (value.mode !== "order" && value.mode !== "choice") return null;
  const items = value.mode === "order" ? value.blocks : value.options;
  if (!Array.isArray(items) || items.length < 2 || items.length > 20 || !items.every((item) => item && typeof item === "object" && !Array.isArray(item) && typeof item.id === "string" && typeof item.text === "string")) return null;
  const blocks = items as Block[];
  return value.mode === "order" ? { mode: "order", blocks } : { mode: "choice", options: blocks };
}

export function BlockExercise({ exercise, pathSlug, label, userId, reviewHref, previewOnly = false }: { exercise: PublicExercise; pathSlug: string; userId?: string; reviewHref?: string; label: string; previewOnly?: boolean }) {
  const tx = useText();

  const config = parseBlockConfig(exercise.publicConfig);
  const draft = usePracticeDraft(exercise, previewOnly ? undefined : userId);
  const order = "order" in draft.value ? draft.value.order : [];
  const choiceId = "choiceId" in draft.value ? draft.value.choiceId : "";
  const checkState = useExerciseCheck(exercise.id, pathSlug, previewOnly, reviewHref);
  const data = exercise.publicConfig && typeof exercise.publicConfig === "object" && !Array.isArray(exercise.publicConfig) ? readQuestionData(exercise.publicConfig.data) : null;
  if (!config) return <p className="border-t border-border py-6 text-sm text-muted-foreground">{tx("Exercise belum siap ditampilkan.")}</p>;

  function move(index: number, direction: -1 | 1) {
    const next = [...order], target = index + direction;
    if (target < 0 || target >= next.length || checkState.pending) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    draft.save({ order: next }); checkState.invalidate();
  }

  return <section id={`practice-${exercise.id}`} aria-label={tx(exercise.title)} className="scroll-mt-24 border-t border-border py-8">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-xl font-semibold tracking-tight">{tx(exercise.title)}</h3><p className="mt-1.5 text-xs text-muted-foreground">{tx(label)}{tx(exercise.isRequired ? " · Wajib" : " · Opsional")}</p></div>{exercise.passed && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{tx("Lulus")}</span>}</div>
    <QuestionPrompt content={exercise.prompt} />
    {data && <QuestionDataView data={data} />}
    <ExerciseDataCanvas datasetId={exerciseDatasetId(exercise.publicConfig)} query={exercise.starterCode ?? ""} />
    {config.mode === "choice" ? <fieldset className="mt-5 space-y-2"><legend className="mb-2 text-sm font-semibold">{tx("Pilih satu jawaban")}</legend>{config.options.map((option) => <label key={option.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-border px-4 py-3 text-sm"><input type="radio" name={`choice-${exercise.id}`} value={option.id} checked={choiceId === option.id} disabled={checkState.pending || draft.status === "loading"} onChange={() => { draft.save({ choiceId: option.id }); checkState.invalidate(); }} />{tx(option.text)}</label>)}</fieldset>
      : <ol className="mt-5 space-y-2">{order.map((id, index) => { const block = config.blocks.find((item) => item.id === id)!; return <li key={id}><div className="flex min-h-14 items-center gap-3 rounded-md border border-border px-3 py-2"><span className="w-6 shrink-0 text-sm font-semibold text-accent">{index + 1}.</span><span className="flex-1 text-sm">{tx(block.text)}</span><button type="button" aria-label={tx(`Naikkan ${block.text}`)} disabled={index === 0 || checkState.pending || draft.status === "loading"} onClick={() => move(index, -1)} className="min-h-11 min-w-11 rounded p-2 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-30"><ArrowUp size={16} /></button><button type="button" aria-label={tx(`Turunkan ${block.text}`)} disabled={index === order.length - 1 || checkState.pending || draft.status === "loading"} onClick={() => move(index, 1)} className="min-h-11 min-w-11 rounded p-2 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-30"><ArrowDown size={16} /></button></div>{exercise.type === "FLOWCHART" && index < order.length - 1 && <ArrowDown size={16} aria-hidden="true" className="mx-auto mt-2 text-accent" />}</li>; })}</ol>}
    <Button type="button" className="mt-5" disabled={previewOnly || draft.status === "loading" || checkState.pending || (config.mode === "choice" && !choiceId)} onClick={() => checkState.check({ answer: config.mode === "choice" ? { choiceId } : { order } })}>{tx(previewOnly ? "Pemeriksaan nonaktif di pratinjau" : "Periksa jawaban")}</Button>
    {userId && !previewOnly && <div className="mt-3"><DraftStatus status={draft.status} restored={draft.restored} onRetry={() => draft.save(draft.value)} onReset={draft.clear} /></div>}
    <div className="mt-5"><PracticeFeedback {...checkState} /></div>
  </section>;
}
