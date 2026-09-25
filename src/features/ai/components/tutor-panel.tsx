"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Lightbulb, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CodeRunResult } from "@/lib/providers/code-runner";
import type { TutorAction } from "@/features/ai/domain/tutor-context";

interface TutorMessage { role: "USER" | "ASSISTANT"; content: string }

const actions: Array<{ action: TutorAction; label: string }> = [
  { action: "explain_concept", label: "Jelaskan konsep" },
  { action: "explain_code", label: "Jelaskan kode" },
  { action: "why_wrong", label: "Mengapa salah?" },
  { action: "hint", label: "Beri petunjuk" },
  { action: "explain_error", label: "Jelaskan error" },
  { action: "explain_trace", label: "Jelaskan trace" },
  { action: "similar_practice", label: "Latihan serupa" },
];
const primaryActions = actions.filter(({ action }) => ["hint", "explain_code", "why_wrong", "explain_trace"].includes(action));
const secondaryActions = actions.filter(({ action }) => !primaryActions.some((primary) => primary.action === action));

export function TutorPanel({
  lessonId, exerciseId, sourceCode = "", visibleOutput = "", visibleTestResults = [], trace,
}: {
  lessonId: string;
  exerciseId?: string;
  sourceCode?: string;
  visibleOutput?: string;
  visibleTestResults?: Array<{ position: number; passed: boolean }>;
  trace?: CodeRunResult["trace"];
}) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const traceSummary = trace?.steps.slice(-20).map((step) =>
    `line ${step.line || "output"}: ${step.event}; vars=${JSON.stringify(step.variables)}${step.condition === undefined ? "" : `; condition=${step.condition}`}${step.iteration === undefined ? "" : `; iteration=${step.iteration}`}`,
  ).join("\n").slice(0, 4_000) ?? "";

  useEffect(() => {
    const query = new URLSearchParams({ lessonId });
    if (exerciseId) query.set("exerciseId", exerciseId);
    fetch(`/api/ai/tutor?${query}`, { cache: "no-store" }).then(async (response) => {
      if (!response.ok) return;
      const payload = await response.json() as { sessionId: string | null; messages: TutorMessage[] };
      setSessionId(payload.sessionId);
      setMessages(payload.messages);
    }).catch(() => undefined);
  }, [lessonId, exerciseId]);

  async function ask(action: TutorAction, text = "") {
    if (pending) return;
    setPending(true); setError(null);
    const displayText = text.trim() || actions.find((item) => item.action === action)?.label || "Minta bantuan";
    setMessages((current) => [...current, { role: "USER", content: displayText }, { role: "ASSISTANT", content: "" }]);
    try {
      const response = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lessonId, exerciseId, sessionId: sessionId ?? undefined, action, message: text,
          sourceCode, visibleOutput, visibleTestResults, traceSummary }),
      });
      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? "AI Tutor belum dapat menjawab.");
      }
      setSessionId(response.headers.get("x-ai-session-id") ?? sessionId);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((current) => current.map((item, index) => index === current.length - 1 ? { ...item, content: item.content + chunk } : item));
      }
      const finalChunk = decoder.decode();
      if (finalChunk) setMessages((current) => current.map((item, index) => index === current.length - 1 ? { ...item, content: item.content + finalChunk } : item));
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "AI Tutor belum dapat menjawab.";
      setError(message);
      setMessages((current) => current.filter((item, index) => !(index === current.length - 1 && item.role === "ASSISTANT" && !item.content)));
    } finally { setPending(false); }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    void ask("message", text);
  }

  return <section aria-label="AI Tutor" className="mt-10 border-t border-border pt-6">
    <div className="flex items-start gap-3"><Lightbulb size={19} className="mt-1 text-primary" aria-hidden="true" /><div><h2 className="text-lg font-semibold">AI Tutor</h2><p className="mt-1 text-sm text-muted-foreground">Petunjuk kontekstual untuk membantumu menemukan langkah berikutnya.</p></div></div>
    <div className="mt-4 flex flex-wrap gap-2">{primaryActions.map(({ action, label }) => <Button key={action} type="button" size="sm" variant="outline" disabled={pending || (action === "explain_trace" && !trace?.steps.length)} onClick={() => void ask(action)}>{label}</Button>)}</div>
    <details className="mt-3 text-sm">
      <summary className="min-h-11 w-fit cursor-pointer py-3 font-medium text-primary focus-visible:outline-2 focus-visible:outline-ring">Pilihan bantuan lainnya</summary>
      <div className="flex flex-wrap gap-2 pb-2">{secondaryActions.map(({ action, label }) => <Button key={action} type="button" size="sm" variant="ghost" disabled={pending} onClick={() => void ask(action)}>{label}</Button>)}</div>
    </details>
    <ol aria-live="polite" className="mt-4 max-h-80 space-y-3 overflow-y-auto">
      {messages.length === 0 && <li className="max-w-[75ch] rounded-md bg-muted px-4 py-3 text-sm leading-6 text-muted-foreground">Pilih petunjuk atau tanyakan bagian konsep, kode, dan langkah eksekusi yang ingin kamu pahami.</li>}
      {messages.map((message, index) => <li key={`${index}-${message.role}`} className={`max-w-[75ch] whitespace-pre-wrap rounded-md px-4 py-3 text-sm leading-6 ${message.role === "USER" ? "ml-auto bg-secondary text-secondary-foreground" : "bg-muted text-foreground"}`}>
        <p className="mb-1 text-xs font-semibold">{message.role === "USER" ? "Kamu" : "ThinkCode Tutor"}</p>
        {message.content || (pending && index === messages.length - 1 ? "Menyiapkan petunjuk…" : "")}
      </li>)}
    </ol>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    <form onSubmit={submit} className="mt-4 flex items-end gap-2">
      <label className="sr-only" htmlFor={`tutor-message-${exerciseId ?? lessonId}`}>Tulis pertanyaan untuk AI Tutor</label>
      <textarea id={`tutor-message-${exerciseId ?? lessonId}`} value={draft} maxLength={1200} rows={2} onChange={(event) => setDraft(event.target.value)} placeholder="Tanyakan tentang konsep, kode, atau hasil run…" className="min-h-12 flex-1 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring" />
      <Button type="submit" disabled={pending || !draft.trim()} aria-label="Kirim pertanyaan"><Send size={16} aria-hidden="true" />Kirim</Button>
    </form>
    <p className="mt-2 text-xs text-muted-foreground">Tutor hanya menerima konteks lesson, kode dan hasil yang terlihat. Gunakan Run atau Check untuk menjalankan kode.</p>
  </section>;
}
