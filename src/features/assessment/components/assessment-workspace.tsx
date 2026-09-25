"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Play, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionNavigator, isAssessmentAnswerComplete } from "@/features/assessment/components/question-navigator";
import { AssessmentQuestionView } from "@/features/assessment/components/question-view";
import type { AssessmentAnswer, PublicAssessmentItem } from "@/features/assessment/types";
import { BrowserJavaScriptRunner } from "@/lib/providers/browser-javascript-runner";
import type { CodeRunResult } from "@/lib/providers/code-runner";
import { OutputPanel } from "@/features/workspace/components/output-panel";

const browserRunner = new BrowserJavaScriptRunner();

function initialAnswers(items: PublicAssessmentItem[]): Record<string, AssessmentAnswer> {
  return Object.fromEntries(items.map((item) => {
    if (item.type === "CODE_COMPLETION" || item.type === "DEBUGGING" || item.type === "PROBLEM_SOLVING") {
      return [item.id, { sourceCode: item.starterCode ?? "" }];
    }
    if (item.type === "PREDICT_OUTPUT") return [item.id, { output: "" }];
    const config = item.publicConfig && typeof item.publicConfig === "object" && !Array.isArray(item.publicConfig) ? item.publicConfig : {};
    const options = config.options;
    if (config.mode === "choice" && Array.isArray(options)) return [item.id, { choiceId: "" }];
    const blocks = config.blocks;
    return [item.id, { order: Array.isArray(blocks) ? blocks.flatMap((block) => block && typeof block === "object" && !Array.isArray(block) && typeof block.id === "string" ? [block.id] : []) : [] }];
  }));
}

export function AssessmentWorkspace({
  sessionId, assessmentTitle, instructions, passingScore, items,
}: { sessionId: string; assessmentTitle: string; instructions: string; passingScore: number; items: PublicAssessmentItem[] }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>(() => initialAnswers(items));
  const [activeIndex, setActiveIndex] = useState(0);
  const [runResult, setRunResult] = useState<CodeRunResult | null>(null);
  const [runPending, setRunPending] = useState(false);
  const [submitPending, setSubmitPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmationRef = useRef<HTMLDialogElement>(null);
  const current = items[activeIndex];
  const currentAnswer = current ? answers[current.id] : undefined;
  const completeCount = useMemo(() => items.filter((item) => isAssessmentAnswerComplete(answers[item.id])).length, [items, answers]);
  const isCode = Boolean(current && (current.type === "CODE_COMPLETION" || current.type === "DEBUGGING" || current.type === "PROBLEM_SOLVING"));

  function updateAnswer(answer: AssessmentAnswer) {
    if (!current) return;
    setAnswers((previous) => ({ ...previous, [current.id]: answer }));
    setRunResult(null);
  }

  async function runLocally() {
    if (!current || !currentAnswer || !("sourceCode" in currentAnswer) || runPending) return;
    setRunPending(true); setRunResult(null); setError(null);
    try { setRunResult(await browserRunner.run({ language: "javascript", sourceCode: currentAnswer.sourceCode, visualize: false })); }
    catch { setError("Run lokal belum dapat dimulai. Coba lagi."); }
    finally { setRunPending(false); }
  }

  async function submitAssessment() {
    if (submitPending || completeCount !== items.length) return;
    setSubmitPending(true); setError(null);
    try {
      const response = await fetch(`/api/assessment-sessions/${sessionId}/submit`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: items.map((item) => ({ itemId: item.id, answer: answers[item.id] })) }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Jawaban belum dapat dikirim.");
      router.replace(`/assessments/sessions/${sessionId}/result`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Jawaban belum dapat dikirim.");
      setSubmitPending(false);
    }
  }

  if (!current) return <p className="text-sm text-muted-foreground">Soal assessment belum tersedia.</p>;
  return <div>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
      <div><h1 className="text-2xl font-semibold tracking-tight">{assessmentTitle}</h1><p className="mt-2 max-w-[72ch] text-sm leading-6 text-muted-foreground">{instructions}</p></div>
      <div className="min-w-36 text-sm tabular-nums text-muted-foreground">
        <p>{completeCount}/{items.length} terjawab</p>
        <div role="progressbar" aria-label="Progres assessment" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={completeCount} className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-[width]" style={{ width: `${items.length ? (completeCount / items.length) * 100 : 0}%` }} />
        </div>
      </div>
    </div>
    <p className="mb-6 rounded-md bg-muted px-4 py-3 text-sm">Mode assessment · Lulus pada skor {passingScore}+ · AI Tutor dan petunjuk dinonaktifkan</p>

    <div className="grid items-start gap-6 md:grid-cols-[12rem_minmax(0,1fr)]">
      <QuestionNavigator items={items} answers={answers} activeIndex={activeIndex} onSelect={(index) => { setActiveIndex(index); setRunResult(null); }} />
      <div className="min-w-0">
        <AssessmentQuestionView item={current} answer={currentAnswer} onAnswer={updateAnswer} />
        {isCode && <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" disabled={runPending || submitPending} onClick={runLocally}><Play size={15} aria-hidden="true" />{runPending ? "Menjalankan…" : "Run lokal"}</Button>
          <span className="text-xs text-muted-foreground">Run membantu meninjau output; skor dihitung ulang di server saat submit.</span>
        </div>}
        {isCode && <div className="mt-5"><OutputPanel result={runResult} error={error} pending={runPending} /></div>}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <Button type="button" variant="outline" disabled={activeIndex === 0 || submitPending} onClick={() => { setActiveIndex((index) => index - 1); setRunResult(null); }}><ArrowLeft size={15} aria-hidden="true" />Sebelumnya</Button>
          {activeIndex < items.length - 1
            ? <Button type="button" variant="outline" disabled={submitPending} onClick={() => { setActiveIndex((index) => index + 1); setRunResult(null); }}>Berikutnya<ArrowRight size={15} aria-hidden="true" /></Button>
            : <Button type="button" disabled={submitPending || completeCount !== items.length} onClick={() => confirmationRef.current?.showModal()}><Send size={15} aria-hidden="true" />Submit Assessment</Button>}
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      </div>
    </div>
    <dialog ref={confirmationRef} aria-labelledby="assessment-confirm-title" className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-lg border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/50">
      <div className="p-6">
        <h2 id="assessment-confirm-title" className="text-lg font-semibold">Kirim jawaban assessment?</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Semua {items.length} jawaban akan dinilai dan sesi ini akan ditutup. Periksa kembali jawabanmu sebelum melanjutkan.</p>
        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" disabled={submitPending} onClick={() => { setError(null); confirmationRef.current?.close(); }}>Kembali meninjau</Button>
          <Button type="button" disabled={submitPending} onClick={() => { void submitAssessment(); }}><Send size={15} aria-hidden="true" />{submitPending ? "Memeriksa jawaban…" : "Kirim jawaban"}</Button>
        </div>
      </div>
    </dialog>
  </div>;
}
