"use client";
import { useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalDraft } from "@/lib/browser/use-local-draft";
import { PRACTICE_DATASETS } from "@/features/database/data/datasets";
import { documentFromDataset } from "../domain/templates";
import { ModelDiagram } from "@/features/schema-builder/components/model-diagram";
import {
  draftSchema,
  type SchemaDraft,
} from "@/features/schema-builder/domain/schema-draft";
import {
  initialDocument,
  parseDocument,
  reconcileSchema,
  sqlabDocumentSchema,
  type SqlabDocument,
} from "../domain/document";
import { StructureEditor } from "./structure-editor";
import { DataEditor } from "./data-editor";
import { QueryPanel } from "./query-panel";
import { AiDesigner } from "./ai-designer";
const tabs = ["Skema", "Data", "Query", "AI"] as const;
export function SqlabWorkspace({ userId }: { userId: string }) {
  const store = useLocalDraft({
    key: `quethink:sqlab:v1:${userId}`,
    signature: "sqlab-v1",
    initial: initialDocument,
    parse: parseDocument,
  });
  const doc = store.value;
  const [tab, setTab] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reset, setReset] = useState(false);
  const [revision, setRevision] = useState(0);
  const [template, setTemplate] = useState<SqlabDocument | null>(null);
  function save(next: SqlabDocument) {
    const parsed = sqlabDocumentSchema.safeParse(next);
    if (!parsed.success)
      return parsed.error.issues[0]?.message ?? "Periksa skema dan datanya.";
    store.save(parsed.data);
    return null;
  }
  function changeSchema(next: SchemaDraft) {
    const parsed = draftSchema.safeParse(next);
    if (!parsed.success)
      return parsed.error.issues[0]?.message ?? "Skema belum valid.";
    return save(reconcileSchema(doc, parsed.data));
  }
  function navigate(e: KeyboardEvent<HTMLDivElement>) {
    const next =
      e.key === "ArrowRight"
        ? (tab + 1) % 4
        : e.key === "ArrowLeft"
          ? (tab + 3) % 4
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? 3
              : -1;
    if (next < 0 || busy) return;
    e.preventDefault();
    setTab(next);
    document.getElementById(`sqlab-tab-${next}`)?.focus();
  }
  return (
    <div className="mt-8 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
        <p role="status" className="text-xs leading-5 text-muted-foreground">
          {store.status === "failed"
            ? "Belum tersimpan. Jangan tutup halaman."
            : store.status === "invalid"
              ? "Draf lama tidak dapat dibaca. Mulai ulang untuk membuat database baru."
              : store.status === "loading"
                ? "Memuat draf…"
                : store.status === "empty"
                  ? "Database baru · tidak memengaruhi nilai"
                  : "Tersimpan di browser ini · tidak memengaruhi nilai"}
        </p>
        <Button variant="ghost" disabled={busy} onClick={() => setReset(true)}>
          Mulai ulang
        </Button>
      </div>
      {reset && (
        <div className="mt-4 space-y-3">
          <p className="text-sm">
            Hapus seluruh skema dan data SQLab saat ini?
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                store.clear();
                setRevision((value) => value + 1);
                setReset(false);
              }}
            >
              Ya, kosongkan
            </Button>
            <Button variant="ghost" onClick={() => setReset(false)}>
              Batal
            </Button>
          </div>
        </div>
      )}
      <div
        role="tablist"
        aria-label="Area SQLab"
        onKeyDown={navigate}
        className="mt-5 grid grid-cols-4 border-b border-border"
      >
        {tabs.map((label, i) => (
          <button
            key={label}
            id={`sqlab-tab-${i}`}
            role="tab"
            aria-selected={tab === i}
            aria-controls={`sqlab-panel-${i}`}
            tabIndex={tab === i ? 0 : -1}
            disabled={busy}
            onClick={() => setTab(i)}
            className={`min-h-12 border-b-2 px-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring ${tab === i ? "border-accent" : "border-transparent text-muted-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <fieldset disabled={busy} className="mt-6 min-w-0">
        <div
          id="sqlab-panel-0"
          role="tabpanel"
          aria-labelledby="sqlab-tab-0"
          hidden={tab !== 0}
        >
          <div className="mb-6">
            <Label htmlFor="database-name">Nama database</Label>
            <Input
              id="database-name"
              className="mt-2"
              defaultValue={doc.name}
              key={doc.name}
              maxLength={60}
              onBlur={(e) =>
                setError(save({ ...doc, name: e.target.value }) ?? "")
              }
            />
          </div>
          {error && (
            <p role="alert" className="mb-4 text-sm text-destructive">
              {error}
            </p>
          )}
          <details className="mb-5 border-b border-border pb-4">
            <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium">
              Mulai dari contoh database
            </summary>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRACTICE_DATASETS.map((dataset) => (
                <Button
                  key={dataset.id}
                  variant="outline"
                  onClick={() => setTemplate(documentFromDataset(dataset))}
                >
                  {dataset.title}
                </Button>
              ))}
            </div>
            {template && (
              <div className="mt-4 space-y-3">
                <p className="text-sm">
                  Ganti database saat ini dengan {template.name}?
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setError(save(template) ?? "");
                      setRevision((value) => value + 1);
                      setTemplate(null);
                    }}
                  >
                    Ya, gunakan contoh
                  </Button>
                  <Button variant="ghost" onClick={() => setTemplate(null)}>
                    Batal
                  </Button>
                </div>
              </div>
            )}
          </details>
          <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <StructureEditor schema={doc.schema} change={changeSchema} />
            <div className="min-w-0">
              <ModelDiagram draft={doc.schema} />
            </div>
          </div>
        </div>
        <div
          id="sqlab-panel-1"
          role="tabpanel"
          aria-labelledby="sqlab-tab-1"
          hidden={tab !== 1}
        >
          <DataEditor key={revision} document={doc} change={save} />
        </div>
        <div
          id="sqlab-panel-3"
          role="tabpanel"
          aria-labelledby="sqlab-tab-3"
          hidden={tab !== 3}
        >
          <AiDesigner
            apply={(next) => {
              const failure = save(next);
              if (failure) setError(failure);
              else {
                setError("");
                setRevision((value) => value + 1);
                setTab(0);
              }
            }}
          />
        </div>
      </fieldset>
      <div
        id="sqlab-panel-2"
        role="tabpanel"
        aria-labelledby="sqlab-tab-2"
        hidden={tab !== 2}
        className="mt-6"
      >
        <QueryPanel
          key={revision}
          document={doc}
          save={save}
          busy={busy}
          setBusy={setBusy}
        />
      </div>
    </div>
  );
}
