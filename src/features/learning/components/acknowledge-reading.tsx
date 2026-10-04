"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AcknowledgeReading({ lessonId, completed }: { lessonId: string; completed: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function acknowledge() {
    if (pending) return;
    setPending(true); setError(null);
    try {
      const response = await fetch(`/api/materials/${lessonId}/read`, { method: "POST" });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Progres belum tersimpan.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Progres belum tersimpan. Coba lagi.");
    } finally { setPending(false); }
  }
  return <div>
    {completed ? <p role="status" className="text-sm font-medium">Materi sudah selesai dibaca.</p> : <Button type="button" className="w-full sm:w-auto" disabled={pending} onClick={acknowledge}>{pending ? "Menyimpan…" : "Selesai dibaca"}</Button>}
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
  </div>;
}
