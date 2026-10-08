"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useText } from "@/i18n/use-text";
import { Button } from "@/components/ui/button";
export function ForumModeration({ id, hidden, locked, reply = false }: { id: string; hidden: boolean; locked?: boolean; reply?: boolean }) {
  const tx = useText(), router = useRouter();
  const [pending, setPending] = useState(false), [error, setError] = useState<string | null>(null);
  async function moderate(action: "lock_topic" | "hide_topic" | "hide_reply", value: boolean) {
    if (pending) return;
    setPending(true);setError(null);
    try {
      const response = await fetch("/api/forum/moderate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ targetId: id, action, value }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Pengaturan belum tersimpan. Coba lagi.");
      router.refresh();
    } catch (cause) { setError(cause instanceof Error && !(cause instanceof TypeError) ? cause.message : "Koneksi terputus. Coba lagi."); }
    finally { setPending(false); }
  }
  return <div className="mt-4">
    <div className="flex flex-wrap gap-2">
      {!reply && <Button variant="outline" size="sm" disabled={pending} onClick={() => void moderate("lock_topic", !locked)}>{tx(locked ? "Buka balasan" : "Tutup balasan")}</Button>}
      <Button variant="outline" size="sm" disabled={pending} onClick={() => void moderate(reply ? "hide_reply" : "hide_topic", !hidden)}>{tx(hidden ? "Tampilkan kembali" : "Sembunyikan")}</Button>
    </div>
    {error && <p role="alert" className="mt-2 text-sm text-destructive">{tx(error)}</p>}
  </div>;
}
