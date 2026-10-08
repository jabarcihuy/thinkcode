"use client";

import { useText } from "@/i18n/use-text";


import { useGuestMode } from "@/features/guest/components/guest-mode";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Lightbulb, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TutorMessageContent } from "./tutor-message";
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
  lessonId, exerciseId, sourceCode = "", visibleOutput = "", visibleTestResults = [], standalone = false,
}: {
  standalone?: boolean;
  lessonId: string;
  exerciseId?: string;
  sourceCode?: string;
  visibleOutput?: string;
  visibleTestResults?: Array<{ position: number; passed: boolean }>;
}) {
  const tx = useText();

  const guest = useGuestMode();
  const endpoint = guest ? "/api/guest/tutor" : "/api/ai/tutor";
  const list = useRef<HTMLOListElement>(null);
  const following = useRef(true);
  const [newMessage, setNewMessage] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (following.current && list.current) list.current.scrollTop = list.current.scrollHeight;
      else setNewMessage(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [messages]);
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
    fetch(`${endpoint}?${query}`, { cache: "no-store" }).then(async (response) => {
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
  }, [lessonId, exerciseId, endpoint]);

  async function ask(action: TutorAction, text = "") {
    if (pending) return;
    setPending(true); setError(null);
    const displayText = text.trim() || tx(actions.find((item) => item.action === action)?.label || "Minta bantuan");
    setMessages((current) => [...current, { role: "USER", content: displayText }, { role: "ASSISTANT", content: "" }]);
    try {
      const response = await fetch(endpoint, {
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
  return <section aria-label={tx("AI Tutor")} className={standalone ? "mt-6 rounded-lg border border-border bg-card p-4 sm:p-6" : "mt-10 border-t border-border pt-6"}>
    <div className="flex items-start gap-3"><Lightbulb size={19} className="mt-1 text-accent" aria-hidden="true" /><div><h2 className="text-lg font-semibold">{tx("AI Tutor")}</h2><p className="mt-1 text-sm text-muted-foreground">{tx("Petunjuk kontekstual untuk membantumu menemukan langkah berikutnya.")}</p></div></div>
    {loadingHistory && <p role="status" className="mt-4 text-sm text-muted-foreground">{tx("Memeriksa konteks dan riwayat chat…")}</p>}
    {blockedMessage ? <p role="status" className="mt-4 rounded-md border border-border px-4 py-3 text-sm leading-6 text-muted-foreground">{tx(blockedMessage)}</p> : <>
      <div className="mt-4 flex flex-wrap gap-2">{primaryActions.map(({ action, label }) => <Button key={action} type="button" size="sm" variant="outline" disabled={disabled} onClick={() => void ask(action)}>{tx(label)}</Button>)}</div>
      {secondaryActions.length > 0 && <details className="mt-3 text-sm">
        <summary className="min-h-11 w-fit cursor-pointer py-3 font-medium text-accent focus-visible:outline-2 focus-visible:outline-ring">{tx("Pilihan bantuan lainnya")}</summary>
        <div className="flex flex-wrap gap-2 pb-2">{secondaryActions.map(({ action, label }) => <Button key={action} type="button" size="sm" variant="ghost" disabled={disabled} onClick={() => void ask(action)}>{tx(label)}</Button>)}</div>
      </details>}
    </>}
    <ol ref={list} tabIndex={0} aria-label={tx("Percakapan tutor")} aria-busy={pending} onScroll={() => {
      const element = list.current;
      if (!element) return;
      following.current = element.scrollHeight - element.scrollTop - element.clientHeight < 48;
      if (following.current) setNewMessage(false);
    }} aria-live="polite" className={`mt-5 space-y-4 overflow-y-auto overscroll-contain focus-visible:outline-2 focus-visible:outline-ring ${standalone ? "max-h-[55dvh] min-h-48" : "max-h-80"}`}>
      {!loadingHistory && !unavailable && messages.length === 0 && <li className="max-w-[75ch] rounded-md bg-muted px-4 py-3 text-sm leading-6 text-muted-foreground">{tx("Pilih bantuan atau tanyakan konsep yang sedang kamu pelajari.")}</li>}
      {messages.map((message, index) => <li key={`${index}-${message.role}`} className={`max-w-[75ch] [overflow-wrap:anywhere] rounded-md px-4 py-3 text-sm leading-6 ${message.role === "USER" ? "ml-auto whitespace-pre-wrap bg-secondary text-secondary-foreground" : "bg-muted text-foreground"}`}>
        <p className="mb-1 text-xs font-semibold">{tx(message.role === "USER" ? "Kamu" : "Quethink Tutor")}</p>
        {message.role === "ASSISTANT" && message.content ? <TutorMessageContent content={message.content} /> : message.content || (pending && index === messages.length - 1 ? tx("Menyiapkan petunjuk…") : "")}
      </li>)}
    </ol>
    {newMessage && <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => { following.current = true; if (list.current) list.current.scrollTop = list.current.scrollHeight; setNewMessage(false); }}>{tx("Lihat pesan terbaru")}</Button>}
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{tx(error)}</p>}
    {!unavailable && <form onSubmit={submit} className="mt-5 flex items-end gap-2 border-t border-border pt-4">
      <label className="sr-only" htmlFor={`tutor-message-${exerciseId ?? lessonId}`}>{tx("Tulis pertanyaan untuk AI Tutor")}</label>
      <textarea id={`tutor-message-${exerciseId ?? lessonId}`} value={draft} maxLength={1200} rows={2} onChange={(event) => setDraft(event.target.value)} placeholder={tx(hasExecutionContext ? "Tanyakan tentang tabel, query, atau hasilnya…" : "Tanyakan tentang konsep basis data…")} disabled={disabled} className="min-h-12 min-w-0 flex-1 resize-y rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60 sm:text-sm" />
      <Button type="submit" disabled={disabled || !draft.trim()} aria-label={tx("Kirim pertanyaan")}><Send size={16} aria-hidden="true" />{tx("Kirim")}</Button>
    </form>}
    <p className="mt-2 text-xs text-muted-foreground">{tx(hasExecutionContext ? "Tutor menerima konteks lesson, query SQL, dan hasil yang terlihat. Gunakan Run pada lab untuk mencoba query." : "Tutor memakai konteks lesson aktif. Untuk membahas hasil query, buka Lab Materi terkait.")}</p>
  </section>;
}
