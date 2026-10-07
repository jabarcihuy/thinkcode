"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Lightbulb, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TutorAction } from "@/features/ai/domain/tutor-context";

interface TutorMessage { role: "USER" | "ASSISTANT"; content: string }

const actions: Array<{ action: TutorAction; label: string }> = [
  { action: "hint", label: "Beri petunjuk" },
  { action: "explain_concept", label: "Jelaskan konsep" },
  { action: "similar_practice", label: "Latihan serupa" },
  { action: "explain_code", label: "Jelaskan query" },
  { action: "why_wrong", label: "Mengapa hasilnya salah?" },
  { action: "explain_error", label: "Jelaskan pesan error" },
  { action: "explain_result", label: "Jelaskan hasil query" },
];

export function TutorPanel({
  lessonId, exerciseId, sourceCode = "", visibleOutput = "", visibleTestResults = [],
}: {
  lessonId: string;
  exerciseId?: string;
  sourceCode?: string;
  visibleOutput?: string;
  visibleTestResults?: Array<{ position: number; passed: boolean }>;
}) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const hasExecutionContext = Boolean(sourceCode.trim() || visibleOutput.trim() || visibleTestResults.length);
  const contextualActions = actions.filter(({ action }) => hasExecutionContext || ["hint", "explain_concept", "similar_practice"].includes(action));
  const primaryActions = contextualActions.slice(0, 3);
  const secondaryActions = contextualActions.slice(3);

  useEffect(() => {
    const query = new URLSearchParams({ lessonId });
    if (exerciseId) query.set("exerciseId", exerciseId);
    let cancelled = false;
    fetch(`/api/ai/tutor?${query}`, { cache: "no-store" }).then(async (response) => {
      const payload = await response.json().catch(() => null) as { sessionId?: string | null; messages?: TutorMessage[]; error?: string } | null;
      if (cancelled) return;
      if (!response.ok) {
        if ([401, 403, 404].includes(response.status)) setBlockedMessage(payload?.error ?? "Chatbot tidak tersedia untuk konteks ini.");
        else setError(payload?.error ?? "Riwayat chatbot belum dapat dimuat.");
        return;
      }
      setSessionId(payload?.sessionId ?? null);
      setMessages(payload?.messages ?? []);
    }).catch(() => {
      if (!cancelled) setError("Riwayat chatbot belum dapat dimuat. Kamu masih bisa memulai percakapan baru.");
    }).finally(() => { if (!cancelled) setLoadingHistory(false); });
    return () => { cancelled = true; };
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
          sourceCode, visibleOutput, visibleTestResults }),
      });
      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        if ([401, 403, 404].includes(response.status)) setBlockedMessage(payload?.error ?? "Chatbot tidak tersedia untuk konteks ini.");
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

  const unavailable = Boolean(blockedMessage);
  const disabled = pending || loadingHistory || unavailable;
  return <section aria-label="AI Tutor" className="mt-10 border-t border-border pt-6">
    <div className="flex items-start gap-3"><Lightbulb size={19} className="mt-1 text-accent" aria-hidden="true" /><div><h2 className="text-lg font-semibold">AI Tutor</h2><p className="mt-1 text-sm text-muted-foreground">Petunjuk kontekstual untuk membantumu menemukan langkah berikutnya.</p></div></div>
    {loadingHistory && <p role="status" className="mt-4 text-sm text-muted-foreground">Memeriksa konteks dan riwayat chat…</p>}
    {blockedMessage ? <p role="status" className="mt-4 rounded-md border border-border px-4 py-3 text-sm leading-6 text-muted-foreground">{blockedMessage}</p> : <>
      <div className="mt-4 flex flex-wrap gap-2">{primaryActions.map(({ action, label }) => <Button key={action} type="button" size="sm" variant="outline" disabled={disabled} onClick={() => void ask(action)}>{label}</Button>)}</div>
      {secondaryActions.length > 0 && <details className="mt-3 text-sm">
        <summary className="min-h-11 w-fit cursor-pointer py-3 font-medium text-accent focus-visible:outline-2 focus-visible:outline-ring">Pilihan bantuan lainnya</summary>
        <div className="flex flex-wrap gap-2 pb-2">{secondaryActions.map(({ action, label }) => <Button key={action} type="button" size="sm" variant="ghost" disabled={disabled} onClick={() => void ask(action)}>{label}</Button>)}</div>
      </details>}
    </>}
    <ol aria-live="polite" className="mt-4 max-h-80 space-y-3 overflow-y-auto">
      {!loadingHistory && !unavailable && messages.length === 0 && <li className="max-w-[75ch] rounded-md bg-muted px-4 py-3 text-sm leading-6 text-muted-foreground">Pilih bantuan atau tanyakan konsep yang sedang kamu pelajari.</li>}
      {messages.map((message, index) => <li key={`${index}-${message.role}`} className={`max-w-[75ch] whitespace-pre-wrap rounded-md px-4 py-3 text-sm leading-6 ${message.role === "USER" ? "ml-auto bg-secondary text-secondary-foreground" : "bg-muted text-foreground"}`}>
        <p className="mb-1 text-xs font-semibold">{message.role === "USER" ? "Kamu" : "Quethink Tutor"}</p>
        {message.content || (pending && index === messages.length - 1 ? "Menyiapkan petunjuk…" : "")}
      </li>)}
    </ol>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    {!unavailable && <form onSubmit={submit} className="mt-4 flex items-end gap-2">
      <label className="sr-only" htmlFor={`tutor-message-${exerciseId ?? lessonId}`}>Tulis pertanyaan untuk AI Tutor</label>
      <textarea id={`tutor-message-${exerciseId ?? lessonId}`} value={draft} maxLength={1200} rows={2} onChange={(event) => setDraft(event.target.value)} placeholder={hasExecutionContext ? "Tanyakan tentang tabel, query, atau hasilnya…" : "Tanyakan konsep pada lesson ini…"} disabled={disabled} className="min-h-12 flex-1 resize-y rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60 sm:text-sm" />
      <Button type="submit" disabled={disabled || !draft.trim()} aria-label="Kirim pertanyaan"><Send size={16} aria-hidden="true" />Kirim</Button>
    </form>}
    <p className="mt-2 text-xs text-muted-foreground">{hasExecutionContext ? "Tutor menerima konteks lesson, query SQL, dan hasil yang terlihat. Gunakan Run pada lab untuk mencoba query." : "Tutor memakai konteks lesson aktif. Untuk membahas hasil query, buka Lab Materi terkait."}</p>
  </section>;
}
