"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JavaScriptEditor } from "@/features/workspace/components/javascript-editor";
import type { AssessmentAnswer, PublicAssessmentItem } from "@/features/assessment/types";
import type { Json } from "@/types/database";

function configObject(value: Json): Record<string, Json | undefined> {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function answerSource(answer: AssessmentAnswer | undefined): string {
  return answer && "sourceCode" in answer ? answer.sourceCode : "";
}

function updateSource(value: string): AssessmentAnswer { return { sourceCode: value }; }

function CodeQuestion({ item, answer, onAnswer }: { item: PublicAssessmentItem; answer: AssessmentAnswer | undefined; onAnswer: (answer: AssessmentAnswer) => void }) {
  return <div className="mt-5">
    <p className="mb-3 text-sm text-muted-foreground">Tulis solusi JavaScript. Editor dapat digunakan selama assessment; AI Tutor dan petunjuk tidak aktif.</p>
    <JavaScriptEditor value={answerSource(answer)} onChange={(value) => onAnswer(updateSource(value))} modelPath={`assessment-${item.id}/main.js`} />
  </div>;
}

function PredictQuestion({ item, answer, onAnswer }: { item: PublicAssessmentItem; answer: AssessmentAnswer | undefined; onAnswer: (answer: AssessmentAnswer) => void }) {
  const config = configObject(item.publicConfig);
  return <div className="mt-5">
    {item.starterCode && <pre className="overflow-x-auto rounded-md bg-code-surface p-4 font-mono text-sm leading-6 text-code-foreground">{item.starterCode}</pre>}
    {typeof config.sampleOutput === "string" && <p className="mt-3 text-sm text-muted-foreground">Sample: {config.sampleOutput}</p>}
    <label htmlFor={`answer-${item.id}`} className="mt-5 block text-sm font-semibold">Prediksi output</label>
    <textarea id={`answer-${item.id}`} value={answer && "output" in answer ? answer.output : ""} onChange={(event) => onAnswer({ output: event.target.value })} maxLength={4000} rows={4} className="mt-2 w-full rounded-md border border-input bg-background p-3 font-mono text-sm focus-visible:outline-2 focus-visible:outline-ring" />
  </div>;
}

function ChoiceQuestion({ item, answer, onAnswer }: { item: PublicAssessmentItem; answer: AssessmentAnswer | undefined; onAnswer: (answer: AssessmentAnswer) => void }) {
  const options = configObject(item.publicConfig).options;
  const choices = Array.isArray(options) ? options.filter((option): option is { id: string; text: string } =>
    Boolean(option && typeof option === "object" && !Array.isArray(option) && typeof option.id === "string" && typeof option.text === "string")) : [];
  return <fieldset className="mt-5 space-y-3"><legend className="text-sm font-semibold">Pilih satu jawaban</legend>
    {choices.map((choice) => <label key={choice.id} className="flex min-h-12 cursor-pointer items-start gap-3 border-b border-border py-3 text-sm leading-6">
      <input type="radio" name={`choice-${item.id}`} value={choice.id} checked={Boolean(answer && "choiceId" in answer && answer.choiceId === choice.id)} onChange={() => onAnswer({ choiceId: choice.id })} className="mt-1 accent-primary" />
      <span>{choice.text}</span>
    </label>)}
  </fieldset>;
}

function OrderQuestion({ item, answer, onAnswer }: { item: PublicAssessmentItem; answer: AssessmentAnswer | undefined; onAnswer: (answer: AssessmentAnswer) => void }) {
  const blocks = configObject(item.publicConfig).blocks;
  const blockList = Array.isArray(blocks) ? blocks.filter((block): block is { id: string; text: string } =>
    Boolean(block && typeof block === "object" && !Array.isArray(block) && typeof block.id === "string" && typeof block.text === "string")) : [];
  const initialOrder = blockList.map((block) => block.id);
  const selectedOrder = answer && "order" in answer ? answer.order : initialOrder;
  function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= selectedOrder.length) return;
    const order = [...selectedOrder];
    [order[index], order[nextIndex]] = [order[nextIndex]!, order[index]!];
    onAnswer({ order });
  }
  const blockById = new Map(blockList.map((block) => [block.id, block.text]));
  return <div className="mt-5"><h3 className="text-sm font-semibold">Atur langkah</h3><ol className="mt-3 space-y-2">
    {selectedOrder.map((id, index) => <li key={id} className="flex items-center gap-2 border-b border-border py-2 text-sm">
      <span className="w-7 text-muted-foreground">{index + 1}.</span><span className="flex-1">{blockById.get(id)}</span>
      <Button type="button" size="sm" variant="outline" className="h-9 w-9 px-0" aria-label={`Pindahkan langkah ${index + 1} ke atas`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={15} /></Button>
      <Button type="button" size="sm" variant="outline" className="h-9 w-9 px-0" aria-label={`Pindahkan langkah ${index + 1} ke bawah`} disabled={index === selectedOrder.length - 1} onClick={() => move(index, 1)}><ArrowDown size={15} /></Button>
    </li>)}
  </ol></div>;
}

export function AssessmentQuestionView({ item, answer, onAnswer }: { item: PublicAssessmentItem; answer: AssessmentAnswer | undefined; onAnswer: (answer: AssessmentAnswer) => void }) {
  const config = configObject(item.publicConfig);
  const mode = config.mode;
  const isCoding = item.type === "CODE_COMPLETION" || item.type === "DEBUGGING" || item.type === "PROBLEM_SOLVING";
  return <article aria-labelledby={`question-title-${item.id}`}>
    <p className="text-sm font-semibold text-primary">{item.topic} · {item.type.replaceAll("_", " ")}</p>
    <h2 id={`question-title-${item.id}`} className="mt-2 text-xl font-semibold">{item.title}</h2>
    <p className="mt-3 max-w-[72ch] text-sm leading-6 text-muted-foreground">{item.prompt}</p>
    {isCoding ? <CodeQuestion item={item} answer={answer} onAnswer={onAnswer} />
      : item.type === "PREDICT_OUTPUT" ? <PredictQuestion item={item} answer={answer} onAnswer={onAnswer} />
        : mode === "choice" ? <ChoiceQuestion item={item} answer={answer} onAnswer={onAnswer} />
          : <OrderQuestion item={item} answer={answer} onAnswer={onAnswer} />}
  </article>;
}
