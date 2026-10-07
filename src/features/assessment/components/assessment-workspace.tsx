"use client";

import { useGuestLearning } from "@/features/guest/components/guest-mode";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionNavigator, isAssessmentAnswerComplete } from "@/features/assessment/components/question-navigator";
import { AssessmentQuestionView } from "@/features/assessment/components/question-view";
import { DraftStatus } from "@/components/forms/draft-status";
import { useLocalDraft } from "@/lib/browser/use-local-draft";
import { assessmentDraftSignature, initialAssessmentDraft, readAssessmentDraft } from "../domain/assessment-draft";
import type { AssessmentAnswer, PublicAssessmentItem } from "@/features/assessment/types";
export function AssessmentWorkspace({
  sessionId, userId, assessmentTitle, instructions, passingScore, items, diagnostic = false, demo = false,
}: { sessionId: string; userId: string; assessmentTitle: string; instructions: string; passingScore: number; diagnostic?: boolean; demo?: boolean; items: PublicAssessmentItem[] }) {
  const router = useRouter();
  const local = useGuestLearning();
  const initial = useMemo(() => initialAssessmentDraft(items), [items]);
  const parse = useMemo(() => (value: unknown) => readAssessmentDraft(value, items), [items]);
  const draft = useLocalDraft({ key: `quethink:assessment-draft:v1:${userId}:${sessionId}`, signature: assessmentDraftSignature(items), initial, parse });
  const { answers, activeIndex } = draft.value;
  const [loginExpired, setLoginExpired] = useState(false);
  useEffect(() => {
    if (draft.status !== "failed") return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [draft.status]);
  function selectQuestion(index: number) {
    draft.save({ ...draft.value, activeIndex: index });
  }
  const [submitPending, setSubmitPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmationRef = useRef<HTMLDialogElement>(null);
  const current = items[activeIndex];
  const currentAnswer = current ? answers[current.id] : undefined;
  const completeCount = useMemo(() => items.filter((item) => isAssessmentAnswerComplete(answers[item.id])).length, [items, answers]);

  function updateAnswer(answer: AssessmentAnswer) {
    if (!current) return;
    draft.save({ ...draft.value, answers: { ...answers, [current.id]: answer } });
  }

  async function submitAssessment() {
    if (submitPending || completeCount !== items.length) return;
    setSubmitPending(true); setError(null);
    try {
      const response = await fetch(demo ? `/api/guest/tests/${sessionId}/submit` : `/api/assessment-sessions/${sessionId}/submit`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: items.map((item) => ({ itemId: item.id, answer: answers[item.id] })) }),
      });
      const payload = await response.json() as { error?: string; score: number; totalCorrect: number; totalItems: number; topicSummary?: { topic: string; passed: boolean }[] };
      if (response.status === 401) {
        setLoginExpired(true);
        throw new Error("Sesi login habis. Masuk kembali untuk melanjutkan tes; jawaban tidak dihapus dari halaman ini.");
      }
      if (response.status === 409 && !demo) {
        // The server may have finished grading before a previous response was lost.
        const saved = await fetch(`/api/assessment-sessions/${sessionId}`, { cache: "no-store" });
        const state = await saved.json() as { session?: { status?: string } };
        if (saved.ok && state.session?.status === "COMPLETED") {
          draft.clear();
          router.replace(`/assessments/sessions/${sessionId}/result`);
          return;
        }
      }
      if (!response.ok) throw new Error(payload.error ?? "Jawaban belum dapat dikirim.");
      draft.clear();
      if (demo) { local?.recordTest(sessionId, { ...payload, passed: !diagnostic && payload.score >= passingScore }); router.replace(`/guest?view=${diagnostic ? "pre-result" : "post-result"}`); return; }
      router.replace(`/assessments/sessions/${sessionId}/result`);
    } catch (cause) {
      setError(cause instanceof Error && !(cause instanceof TypeError) ? cause.message : "Koneksi terputus. Jawaban tidak dihapus; periksa koneksi lalu kirim lagi.");
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
    <p className="mb-6 rounded-md bg-muted px-4 py-3 text-sm">{diagnostic ? "Pre-test · Tanpa syarat lulus · AI dan petunjuk dinonaktifkan" : `Post-test · Lulus pada skor ${passingScore}+ · AI dan petunjuk dinonaktifkan`}</p>

    <div className="mb-6"><DraftStatus status={draft.status} restored={draft.restored} onRetry={() => draft.save(draft.value)} onReset={draft.clear} /></div>
    {draft.status === "loading" ? <p role="status">Menyiapkan jawaban tes…</p> : <div className="grid min-w-0 grid-cols-1 items-start gap-6 md:grid-cols-[12rem_minmax(0,1fr)]">
      <QuestionNavigator items={items} answers={answers} activeIndex={activeIndex} onSelect={selectQuestion} />
      <div className="min-w-0">
        <AssessmentQuestionView item={current} answer={currentAnswer} onAnswer={updateAnswer} disabled={submitPending} />
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <Button type="button" variant="outline" disabled={activeIndex === 0 || submitPending} onClick={() => selectQuestion(activeIndex - 1)}><ArrowLeft size={15} aria-hidden="true" />Sebelumnya</Button>
          {activeIndex < items.length - 1
            ? <Button type="button" variant="outline" disabled={submitPending} onClick={() => selectQuestion(activeIndex + 1)}>Berikutnya<ArrowRight size={15} aria-hidden="true" /></Button>
            : <Button type="button" disabled={submitPending || completeCount !== items.length} onClick={() => confirmationRef.current?.showModal()}><Send size={15} aria-hidden="true" />{diagnostic ? "Kirim pre-test" : "Kirim post-test"}</Button>}
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      </div>
    </div>}
    {loginExpired && <Button asChild variant="outline" className="mt-4"><Link href="/login">Masuk kembali</Link></Button>}
    <dialog ref={confirmationRef} aria-labelledby="assessment-confirm-title" className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-lg border border-border bg-background p-0 text-foreground shadow-surface backdrop:bg-black/50">
      <div className="p-6">
        <h2 id="assessment-confirm-title" className="text-lg font-semibold">Kirim jawaban assessment?</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Semua {items.length} jawaban akan dinilai dan sesi ini akan ditutup. Periksa kembali jawabanmu sebelum melanjutkan.</p>
        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {loginExpired && <Button asChild variant="outline"><Link href="/login">Masuk kembali</Link></Button>}
          <Button type="button" variant="outline" disabled={submitPending} onClick={() => { setError(null); confirmationRef.current?.close(); }}>Kembali meninjau</Button>
          <Button type="button" disabled={submitPending} onClick={() => { void submitAssessment(); }}><Send size={15} aria-hidden="true" />{submitPending ? "Memeriksa jawaban…" : "Kirim jawaban"}</Button>
        </div>
      </div>
    </dialog>
  </div>;
}
