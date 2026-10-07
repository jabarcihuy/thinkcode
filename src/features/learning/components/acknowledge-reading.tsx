"use client";

import { useGuestLearning, useGuestMode } from "@/features/guest/components/guest-mode";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AcknowledgeReading({ lessonId, completed, labHref }: { lessonId: string; completed: boolean; labHref: string }) {
  const router = useRouter();
  const guest = useGuestMode();
  const local = useGuestLearning();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function acknowledge() {
    if (pending) return;
    if (guest) { local?.markRead(lessonId); router.push(labHref); return; }
    setPending(true); setError(null);
    try {
      const response = await fetch(`/api/materials/${lessonId}/read`, { method: "POST" });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Progres belum tersimpan.");
      router.push(labHref);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Progres belum tersimpan. Coba lagi.");
    } finally { setPending(false); }
  }
  return <div>
    {completed ? <Button asChild className="w-full sm:w-auto"><Link href={labHref}>Lanjut ke latihan inti<ArrowRight size={16} aria-hidden="true" /></Link></Button> : <Button type="button" className="w-full whitespace-normal sm:w-auto" disabled={pending} onClick={acknowledge}>{pending ? "Menyimpan bacaan…" : "Selesai membaca, lanjut ke Lab"}<ArrowRight size={16} aria-hidden="true" /></Button>}
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
  </div>;
}
