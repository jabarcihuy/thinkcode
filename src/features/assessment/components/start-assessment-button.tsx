"use client";

import { useText } from "@/i18n/use-text";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StartAssessmentButton({ slug, activeSessionId, label }: { slug: string; activeSessionId: string | null; label: string }) {
  const tx = useText();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function start() {
    setPending(true); setError(null);
    try {
      const response = await fetch(`/api/assessments/${slug}/start`, { method: "POST" });
      const payload = await response.json() as { sessionId?: string; error?: string };
      if (!response.ok || !payload.sessionId) throw new Error(payload.error ?? "Assessment belum dapat dimulai.");
      router.push(`/assessments/sessions/${payload.sessionId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Assessment belum dapat dimulai.");
      setPending(false);
    }
  }

  return <div className="mt-4">
    <Button type="button" disabled={pending} onClick={start}>{tx(pending ? "Menyiapkan assessment…" : activeSessionId ? "Lanjutkan" : label)}<ArrowRight size={16} aria-hidden="true" /></Button>
    {error && <p role="alert" className="mt-2 text-sm text-destructive">{tx(error)}</p>}
  </div>;
}
