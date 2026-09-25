"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicExercise } from "@/features/practice/types";
import { PracticeFeedback } from "@/features/practice/components/practice-feedback";
import { useExerciseCheck } from "@/features/practice/components/use-exercise-check";
import type { Json } from "@/types/database";

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

export function BlockExercise({ exercise, pathSlug, label }: { exercise: PublicExercise; pathSlug: string; label: string }) {
  const config = parseBlockConfig(exercise.publicConfig);
  const [order, setOrder] = useState<string[]>(config?.mode === "order" ? config.blocks.map((block) => block.id) : []);
  const [choiceId, setChoiceId] = useState("");
  const checkState = useExerciseCheck(exercise.id, pathSlug);
  if (!config) return <p className="border-t border-border py-6 text-sm text-muted-foreground">Exercise belum siap ditampilkan.</p>;

  function move(index: number, direction: -1 | 1) {
    setOrder((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return <section aria-label={exercise.title} className="border-t border-border py-8">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-primary">{label}{exercise.isRequired ? " · Wajib" : " · Opsional"}</p><h3 className="mt-2 text-xl font-bold tracking-tight">{exercise.title}</h3></div>{exercise.passed && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">Lulus</span>}</div>
    <p className="mt-4 leading-7 text-muted-foreground">{exercise.prompt}</p>
    {config.mode === "choice" ? <fieldset className="mt-5 space-y-2"><legend className="mb-2 text-sm font-semibold">{exercise.type === "FLOWCHART" ? "Pilih node yang hilang" : "Pilih satu langkah"}</legend>{config.options.map((option) => <label key={option.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-border px-4 py-3 text-sm"><input type="radio" name={`choice-${exercise.id}`} value={option.id} checked={choiceId === option.id} onChange={() => setChoiceId(option.id)} />{option.text}</label>)}</fieldset>
      : <ol className="mt-5 space-y-2">{order.map((id, index) => { const block = config.blocks.find((item) => item.id === id)!; return <li key={id}><div className="flex min-h-14 items-center gap-3 rounded-md border border-border px-3 py-2"><span className="w-6 shrink-0 text-sm font-semibold text-primary">{index + 1}.</span><span className="flex-1 text-sm">{block.text}</span><button type="button" aria-label={`Naikkan ${block.text}`} disabled={index === 0} onClick={() => move(index, -1)} className="rounded p-2 disabled:opacity-30"><ArrowUp size={16} /></button><button type="button" aria-label={`Turunkan ${block.text}`} disabled={index === order.length - 1} onClick={() => move(index, 1)} className="rounded p-2 disabled:opacity-30"><ArrowDown size={16} /></button></div>{exercise.type === "FLOWCHART" && index < order.length - 1 && <ArrowDown size={16} aria-hidden="true" className="mx-auto mt-2 text-primary" />}</li>; })}</ol>}
    <Button type="button" className="mt-5" disabled={checkState.pending || (config.mode === "choice" && !choiceId)} onClick={() => checkState.check({ answer: config.mode === "choice" ? { choiceId } : { order } })}>Check Answer</Button>
    <div className="mt-5"><PracticeFeedback {...checkState} /></div>
  </section>;
}
