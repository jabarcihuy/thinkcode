"use client";

import { useGuestMode } from "@/features/guest/components/guest-mode";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GradeResult } from "@/features/practice/types";

export function useExerciseCheck(exerciseId: string, pathSlug: string, previewOnly = false, reviewHref?: string) {
  const router = useRouter();
  const guest = useGuestMode();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function check(payload: { sourceCode?: string; answer?: unknown; runResults?: unknown }) {
    if (pending || previewOnly) return;
    setPending(true); setError(null); setResult(null);
    try {
      const response = await fetch(guest ? `/api/guest/check/${exerciseId}` : `/api/exercises/${exerciseId}/check`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathSlug, ...payload }),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        setError(typeof data === "object" && data !== null && "error" in data && typeof data.error === "string" ? data.error : "Jawaban belum dapat diperiksa.");
        return;
      }
      const grade = data as GradeResult;
      setResult(grade);
      if (grade.passed && !guest) router.refresh();
    } catch { setError("Koneksi terputus. Coba periksa jawaban lagi."); }
    finally { setPending(false); }
  }

  function invalidate() { setResult(null); setError(null); }
  return { pending, result, error, check, invalidate, reviewHref };
}
