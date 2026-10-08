"use client";


import { useText } from "@/i18n/use-text";

import { useGuestMode } from "@/features/guest/components/guest-mode";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ModelDiagram } from "@/features/schema-builder/components/model-diagram";
import { parseDocument, type SqlabDocument } from "../domain/document";
export function AiDesigner({ apply }: { apply: (doc: SqlabDocument) => string | null }) {
  const tx = useText();

  const guest = useGuestMode();
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState<SqlabDocument | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setDraft(null);
    controller.current = new AbortController();
    try {

      const response = await fetch(guest ? "/api/guest/sqlab" : "/api/sqlab/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: controller.current.signal,
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error ?? "AI sedang tidak tersedia.");
      const next = parseDocument(payload.draft);
      if (!next) throw new Error("Rancangan belum valid. Coba lagi.");
      setDraft(next);
    } catch (e) {
      if (!controller.current.signal.aborted)
        setError(e instanceof Error ? e.message : "AI sedang tidak tersedia.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-5">
      <div className="max-w-[68ch]">
        <h2 className="text-2xl font-semibold tracking-tight">{tx("Dari ide menjadi database")}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{tx("Jelaskan kebutuhanmu. Tinjau skema dan contoh data, lalu terapkan saat sudah sesuai.")}</p>
      </div>
      <form onSubmit={generate} className="space-y-3">
        <Label htmlFor="sqlab-prompt">{tx("Database apa yang ingin dibuat?")}</Label>
        <textarea
          id="sqlab-prompt"
          name="prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          disabled={busy}
          minLength={10}
          maxLength={2000}
          required
          rows={4}
          className="w-full rounded-lg border border-border bg-background p-3 text-base focus-visible:outline-2 focus-visible:outline-ring"
          placeholder={tx("Buat database perpustakaan dengan buku, anggota, dan peminjaman. Isi contoh datanya.")}
        />
        <div className="flex flex-wrap gap-2" aria-label={tx("Contoh ide database")}>
          {[
            ["Toko online", "Buat database toko online dengan pelanggan, produk, pesanan, dan detail pesanan. Tambahkan contoh data sintetis."],
            ["Perpustakaan", "Buat database perpustakaan dengan buku, anggota, dan peminjaman. Isi contoh datanya."],
            ["Reservasi", "Buat database reservasi ruang dengan ruangan, pengguna, dan pemesanan. Tambahkan contoh data sintetis."],
          ].map(([label, example]) => <Button key={label} type="button" variant="outline" size="sm" disabled={busy} onClick={() => { setPrompt(tx(example!)); document.getElementById("sqlab-prompt")?.focus(); }}>{tx(label!)}</Button>)}
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          {tx("Gunakan data sintetis. AI tidak membaca isi database kamu; hanya deskripsi ini yang dikirim.")}</p>
        <Button disabled={busy || prompt.trim().length < 10} type="submit" className="w-full sm:w-auto">
          {tx(busy ? "Menyusun rancangan…" : "Buat rancangan")}
        </Button>
      </form>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {tx(error)}
        </p>
      )}
      {draft && (
        <div className="space-y-4 border-t border-border pt-5">
          <h3 className="text-lg font-semibold">{tx("Draf:")}{" "}{draft.name}</h3>
          <p className="text-sm">
            {draft.schema.tables.length} {" "}{tx("tabel ·")}{" "}{draft.schema.relations.length}{" "}
            {tx("relasi ·")}{" "}
            {Object.values(draft.rows).reduce((n, r) => n + r.length, 0)} {tx("record")}</p>
          <ModelDiagram draft={draft.schema} />
          <details>
            <summary className="min-h-11 cursor-pointer py-3 font-medium">
              {tx("Tinjau contoh data")}</summary>
            {draft.schema.tables.map((t) => (
              <div key={t.id} className="mt-3">
                <h4 className="font-mono">{t.name}</h4>
                <pre tabIndex={0} aria-label={`${tx("Contoh data")} ${t.name}`} className="mt-2 max-h-60 overflow-auto rounded-lg bg-secondary p-3 text-xs focus-visible:outline-2 focus-visible:outline-ring">
                  {JSON.stringify(draft.rows[t.id] ?? [], null, 2)}
                </pre>
              </div>
            ))}
          </details>
          <p className="text-sm text-muted-foreground">
            {tx("Menerapkan draf mengganti skema dan data SQLab saat ini. Tinjau sebelum melanjutkan.")}</p>
          <Button
            onClick={() => {
              const failure = apply(draft);
              if (failure) setError(failure);
              else setDraft(null);
            }}
          >
            {tx("Terapkan rancangan")}</Button>
          <Button variant="ghost" onClick={() => setDraft(null)}>
            {tx("Buang draf")}</Button>
        </div>
      )}
    </section>
  );
}
