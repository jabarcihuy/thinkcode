"use client";
import { useGuestMode } from "@/features/guest/components/guest-mode";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ModelDiagram } from "@/features/schema-builder/components/model-diagram";
import { parseDocument, type SqlabDocument } from "../domain/document";
export function AiDesigner({ apply }: { apply: (doc: SqlabDocument) => void }) {
  const guest = useGuestMode();
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
      const prompt = String(new FormData(event.currentTarget).get("prompt"));
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
      <h2 className="text-lg font-semibold">Rancang database bersama AI</h2>
      <form onSubmit={generate} className="space-y-3">
        <Label htmlFor="sqlab-prompt">Database apa yang ingin dibuat?</Label>
        <textarea
          id="sqlab-prompt"
          name="prompt"
          minLength={10}
          maxLength={2000}
          required
          rows={4}
          className="w-full rounded-lg border border-border bg-background p-3 text-base focus-visible:outline-2 focus-visible:outline-ring"
          placeholder="Buat database perpustakaan dengan buku, anggota, dan peminjaman. Isi contoh datanya."
        />
        <p className="text-xs leading-5 text-muted-foreground">
          Gunakan data sintetis. AI tidak membaca isi database kamu; hanya
          deskripsi ini yang dikirim.
        </p>
        <Button disabled={busy} type="submit">
          {busy ? "Menyusun rancangan…" : "Buat rancangan"}
        </Button>
      </form>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {draft && (
        <div className="space-y-4 border-t border-border pt-5">
          <h3 className="text-lg font-semibold">Draf: {draft.name}</h3>
          <p className="text-sm">
            {draft.schema.tables.length} tabel · {draft.schema.relations.length}{" "}
            relasi ·{" "}
            {Object.values(draft.rows).reduce((n, r) => n + r.length, 0)} record
          </p>
          <ModelDiagram draft={draft.schema} />
          <details>
            <summary className="min-h-11 cursor-pointer py-3 font-medium">
              Tinjau contoh data
            </summary>
            {draft.schema.tables.map((t) => (
              <div key={t.id} className="mt-3">
                <h4 className="font-mono">{t.name}</h4>
                <pre className="mt-2 max-h-60 overflow-auto rounded-lg bg-secondary p-3 text-xs">
                  {JSON.stringify(draft.rows[t.id] ?? [], null, 2)}
                </pre>
              </div>
            ))}
          </details>
          <p className="text-sm text-muted-foreground">
            Menerapkan draf mengganti skema dan data SQLab saat ini. Tinjau
            sebelum melanjutkan.
          </p>
          <Button
            onClick={() => {
              apply(draft);
              setDraft(null);
            }}
          >
            Terapkan rancangan
          </Button>
          <Button variant="ghost" onClick={() => setDraft(null)}>
            Buang draf
          </Button>
        </div>
      )}
    </section>
  );
}
