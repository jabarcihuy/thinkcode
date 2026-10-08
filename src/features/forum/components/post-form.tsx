"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useText } from "@/i18n/use-text";
import { Button } from "@/components/ui/button";
const field = "mt-2 w-full rounded-md border border-input bg-background px-3 py-3 text-base focus-visible:outline-2 focus-visible:outline-ring";
export function ForumPostForm({ topicId }: { topicId?: string }) {
  const tx = useText(), router = useRouter();
  const [pending, setPending] = useState(false), [error, setError] = useState<string | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget, data = new FormData(form);
    const payload = topicId ? { body: data.get("body") } : { title: data.get("title"), body: data.get("body"), category: data.get("category") };
    setPending(true); setError(null);
    try {
      const response = await fetch(topicId ? `/api/forum/topics/${topicId}/replies` : "/api/forum/topics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { id?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Diskusi belum tersimpan. Coba lagi.");
      form.reset();
      if (topicId) router.refresh(); else if (result.id) router.push(`/forum/${result.id}`);
    } catch (cause) { setError(cause instanceof Error && !(cause instanceof TypeError) ? cause.message : "Koneksi terputus. Tulisanmu tetap ada; coba kirim lagi."); }
    finally { setPending(false); }
  }
  return <form onSubmit={submit} className="space-y-5" aria-label={tx(topicId ? "Tulis balasan" : "Buat diskusi")}>
    <fieldset disabled={pending} className="space-y-5">
      {!topicId && <>
        <label className="block text-sm font-semibold">{tx("Kategori")}<select name="category" className={field} defaultValue="DATABASE"><option value="DATABASE">{tx("Basis Data")}</option><option value="GENERAL">{tx("Umum")}</option></select></label>
        <label className="block text-sm font-semibold">{tx("Judul diskusi")}<input name="title" required minLength={6} maxLength={140} className={field} /></label>
      </>}
      <label className="block text-sm font-semibold">{tx(topicId ? "Balasan" : "Isi diskusi")}<textarea name="body" required minLength={topicId ? 2 : 10} maxLength={topicId ? 4000 : 6000} rows={topicId ? 4 : 6} className={field} /></label>
      <Button type="submit" className="min-h-12 w-full sm:w-auto">{tx(pending ? "Mengirim…" : topicId ? "Kirim balasan" : "Buat diskusi")}</Button>
    </fieldset>
    {error && <p role="alert" className="text-sm leading-6 text-destructive">{tx(error)}</p>}
  </form>;
}
