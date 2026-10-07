"use client";

import { useGuestMode } from "@/features/guest/components/guest-mode";
import { Button } from "@/components/ui/button";
import type { DraftStatus as Status } from "@/lib/browser/local-draft-store";

export function DraftStatus({ status, restored, onRetry, onReset }: {
  status: Status; restored: boolean; onRetry: () => void; onReset: () => void;
}) {
  const guest = useGuestMode();
  if (guest) return <p role="status" className="text-sm text-muted-foreground">Mode tamu · jawaban tidak disimpan.</p>;
  return <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
    <p role="status" className={`min-w-0 leading-6 ${status === "failed" || status === "invalid" ? "text-destructive" : "text-muted-foreground"}`}>
      {status === "loading" ? "Memulihkan jawaban…" : status === "saved" ? `${restored ? "Jawaban dipulihkan. " : ""}Tersimpan di browser ini.` : status === "failed" ? "Belum tersimpan. Jangan tutup halaman; coba simpan lagi." : status === "invalid" ? "Draf lama tidak cocok atau rusak. Jawaban lama belum dipulihkan." : "Jawaban akan tersimpan otomatis di browser ini."}
    </p>
    {status === "failed" && <Button variant="outline" size="sm" type="button" onClick={onRetry}>Coba simpan lagi</Button>}
    {status === "invalid" && <Button variant="outline" size="sm" type="button" onClick={onReset}>Buang draf lama</Button>}
  </div>;
}
