"use client";

import { useMemo, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { MODELING_SCENARIOS, type ModelingScenario } from "../data/scenarios";
import { draftSchema, emptyDraft, MAX_TABLES, readDraft, type SchemaDraft } from "../domain/schema-draft";
import { createDraftStore } from "../browser/draft-store";
import { TableEditor } from "./table-editor";
import { RelationEditor } from "./relation-editor";
import { ModelDiagram } from "./model-diagram";
import { ModelFeedback } from "./model-feedback";
import { ModelFormError } from "./model-form-error";

const tabs = [{ id: "edit", title: "Susun" }, { id: "diagram", title: "Diagram" }, { id: "feedback", title: "Periksa" }] as const;
type TabId = typeof tabs[number]["id"];

export function SchemaBuilder() {
  const [scenarioId, setScenarioId] = useState("library");
  const scenario = MODELING_SCENARIOS.find((item) => item.id === scenarioId)!;
  return <div className="mt-5 sm:mt-8">
    <div className="max-w-xl"><Label htmlFor="model-scenario">Kasus latihan</Label><Select id="model-scenario" className="mt-2" value={scenario.id} onChange={(event) => setScenarioId(event.target.value)}>{MODELING_SCENARIOS.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</Select><p className="mt-2 text-sm leading-6 text-muted-foreground">{scenario.prompt}</p></div>
    <ScenarioWorkspace key={scenario.id} scenario={scenario} />
  </div>;
}

function ScenarioWorkspace({ scenario }: { scenario: ModelingScenario }) {
  const store = useMemo(() => createDraftStore(scenario.id), [scenario.id]);
  const raw = useSyncExternalStore(store.subscribe, store.getSnapshot, () => null);
  const parsed = useMemo(() => readDraft(raw), [raw]);
  const draft = useMemo(() => parsed ?? emptyDraft(), [parsed]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("edit");
  const [error, setError] = useState("");
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);
  const table = draft.tables.find((item) => item.id === activeId) ?? draft.tables[0];

  function change(next: SchemaDraft): string | null {
    const validated = draftSchema.safeParse(next);
    if (!validated.success) return validated.error.issues[0]?.message ?? "Periksa kembali struktur skema.";
    setStorageAvailable(store.save(validated.data));
    return null;
  }
  function addTable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const nextTable = { id: crypto.randomUUID(), name: String(new FormData(form).get("new-table")).trim(), columns: [] };
    const failure = change({ ...draft, tables: [...draft.tables, nextTable] });
    setError(failure ?? "");
    if (!failure) { setActiveId(nextTable.id); form.reset(); }
  }
  function navigateTabs(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((item) => item.id === tab);
    const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault(); setTab(tabs[next]!.id); document.getElementById(`schema-tab-${tabs[next]!.id}`)?.focus();
  }

  return <>
    <div className="mt-4 flex items-center justify-between gap-2 border-y border-border py-2">
      <p role="status" className="min-w-0 flex-1 text-xs leading-5 text-muted-foreground">{!storageAvailable ? "Draft belum tersimpan; hanya tersedia selama halaman ini terbuka." : raw && parsed ? "Draft tersimpan di browser." : "Draft baru."}<span className="block">Tidak mengubah progres atau nilai.</span></p>
      <Button type="button" variant="ghost" className="shrink-0 px-2" disabled={!draft.tables.length && !raw} onClick={() => setConfirmReset(true)}><RotateCcw size={15} aria-hidden="true" />Mulai ulang</Button>
    </div>
    {confirmReset && <div className="mt-4" role="group" aria-label="Konfirmasi mulai ulang"><p className="text-sm leading-6">Kosongkan draft untuk kasus {scenario.title.toLowerCase()}?</p><div className="mt-2 flex gap-2"><Button type="button" variant="outline" onClick={() => { change(emptyDraft()); setError(""); setActiveId(null); setConfirmReset(false); }}>Ya, kosongkan</Button><Button type="button" variant="ghost" onClick={() => setConfirmReset(false)}>Batal</Button></div></div>}
    {raw && !parsed && <p role="alert" className="mt-4 text-sm leading-6 text-destructive">Draft lama tidak dapat dibaca. Pilih Mulai ulang untuk membuat draft baru.</p>}
    <div role="tablist" aria-label="Area pembuat skema" onKeyDown={navigateTabs} className="mt-4 grid grid-cols-3 border-b border-border lg:hidden">
      {tabs.map((item) => <button key={item.id} id={`schema-tab-${item.id}`} type="button" role="tab" aria-selected={tab === item.id} aria-controls={`schema-panel-${item.id}`} tabIndex={tab === item.id ? 0 : -1} onClick={() => setTab(item.id)} className={`min-h-12 border-b-2 px-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring ${tab === item.id ? "border-accent text-foreground" : "border-transparent text-muted-foreground"}`}>{item.title}</button>)}
    </div>
    <div className="mt-5 grid min-w-0 items-start gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
      <section id="schema-panel-edit" role="tabpanel" aria-labelledby="schema-tab-edit" className={`min-w-0 ${tab === "edit" ? "block" : "hidden"} lg:block`}>
        <h2 id="schema-edit-title" className="text-lg font-semibold">Susun tabel</h2>
        <form onSubmit={addTable} onChange={() => setError("")} className="mt-4"><Label htmlFor="new-table">Tabel baru</Label><div className="mt-2 flex gap-2"><Input id="new-table" name="new-table" required maxLength={30} autoCapitalize="none" spellCheck={false} placeholder="misalnya members" disabled={draft.tables.length >= MAX_TABLES} aria-invalid={!!error} aria-describedby={error ? "new-table-error" : undefined} /><Button type="submit" className="shrink-0 px-3" disabled={draft.tables.length >= MAX_TABLES} aria-label="Tambah tabel"><Plus size={18} aria-hidden="true" /></Button></div><ModelFormError id="new-table-error" message={error} /><p className="mt-2 text-xs leading-5 text-muted-foreground">Gunakan huruf kecil dan garis bawah. Maksimal 6 tabel dan 8 kolom per tabel.</p></form>
        {table && <><div className="mt-5"><Label htmlFor="edit-table">Tabel yang diedit</Label><Select id="edit-table" className="mt-2" value={table.id} onChange={(event) => setActiveId(event.target.value)}>{draft.tables.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</Select></div><TableEditor key={table.id} table={table} draft={draft} change={change} /></>}
        <RelationEditor draft={draft} change={change} />
      </section>
      <div className="min-w-0">
        <div id="schema-panel-diagram" role="tabpanel" aria-labelledby="schema-tab-diagram" className={`${tab === "diagram" ? "block" : "hidden"} lg:block`}><ModelDiagram draft={draft} /></div>
        <div id="schema-panel-feedback" role="tabpanel" aria-labelledby="schema-tab-feedback" className={`${tab === "feedback" ? "block" : "hidden"} lg:mt-8 lg:block`}><ModelFeedback draft={draft} scenario={scenario} /></div>
      </div>
    </div>
  </>;
}
