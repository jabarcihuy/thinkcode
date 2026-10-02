"use client";

import { useId, useState } from "react";
import { ArrowRight, Check, Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatabaseQueryDiagram } from "./database-query-diagram";
import { CampusRecordTable } from "./campus-record-table";
import { CAMPUS_DATASET } from "../data/datasets";
import type { DatasetSnapshot, PracticeDataset, RecordSelection } from "../data/dataset-types";
import { initialDatasetSnapshot, recordId, recordLabel, relatedRecords, selectionKey } from "../domain/dataset-exploration";

export function CampusDataExplorer({ snapshot: suppliedSnapshot, query = "", step = 1, dataset = CAMPUS_DATASET }: { snapshot?: DatasetSnapshot; dataset?: PracticeDataset; query?: string; step?: number }) {
  const [seed] = useState(() => initialDatasetSnapshot(dataset));
  const snapshot = suppliedSnapshot ?? seed;
  const [table, setTable] = useState(dataset.tables[0]!.name);
  const [selection, setSelection] = useState<RecordSelection | null>(null);
  const [onlyRelated, setOnlyRelated] = useState(false);
  const id = useId();
  const related = relatedRecords(dataset, snapshot, selection);
  const tables = dataset.tables.map((item) => item.name);
  const selectedRow = selection ? snapshot[selection.table]!.find((row) => recordId(dataset, selection.table, row) === selection.id) : null;
  const selected = selectedRow ? selection : null;
  const rows = onlyRelated && selected ? snapshot[table]!.filter((row) => related.has(selectionKey({ table, id: recordId(dataset, table, row) }))) : snapshot[table]!;

  function chooseTable(name: string) { setTable(name); setOnlyRelated(false); }
  function chooseRecord(record: RecordSelection | null) { setSelection(record); setOnlyRelated(false); }

  return <div className="min-w-0 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-semibold">{dataset.title}</p>
      <div role="group" aria-label="Pilih tabel untuk melihat record" className="flex max-w-full flex-wrap gap-1">
        {tables.map((name) => <Button key={name} type="button" size="sm" className="px-3" variant={table === name ? "outline" : "ghost"} aria-pressed={table === name} aria-controls={`${id}-records`} onClick={() => chooseTable(name)}><span className="font-mono text-xs">{name}</span><span className="text-[11px] tabular-nums text-muted-foreground">{snapshot[name]!.length}</span></Button>)}
      </div>
    </div>
    <p className="-mt-2 text-xs leading-5 text-muted-foreground sm:hidden">Pilih nama tabel untuk memfokuskan skema, lalu pilih key untuk melihat relasinya.</p>
    <DatabaseQueryDiagram dataset={dataset} query={query} step={step} snapshot={snapshot} selectedTable={table} onTableSelect={chooseTable} recordSelection={selected} />
    <section id={`${id}-records`} aria-label={`Data tabel ${table}`} className="overflow-hidden rounded-lg border border-input">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="text-sm font-semibold">Record <span className="font-mono">{table}</span><span className="ml-2 text-xs font-normal tabular-nums text-muted-foreground">{rows.length} / {snapshot[table]!.length}</span></p>
        {selected && <Button type="button" variant="ghost" size="sm" className="gap-1.5 px-2 text-xs" aria-pressed={onlyRelated} onClick={() => setOnlyRelated((value) => !value)}>{onlyRelated ? <Check size={13} aria-hidden="true" /> : <Link2 size={13} aria-hidden="true" />}Hanya terkait</Button>}
      </div>
      {selected && selectedRow && <div className="border-b border-border bg-muted px-4 py-3">
        <div className="flex items-start justify-between gap-3"><p aria-live="polite" className="text-sm"><span className="font-mono text-xs">{selected.table} #{selected.id}</span><span className="ml-2 text-muted-foreground">{recordLabel(dataset, selected.table, selectedRow)}</span></p><button type="button" aria-label="Hapus pilihan record" className="-my-2 flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring" onClick={() => chooseRecord(null)}><X size={15} aria-hidden="true" /></button></div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">{tables.filter((name) => name !== selected.table && [...related].some((key) => key.startsWith(`${name}:`))).map((name) => <button type="button" key={name} className="inline-flex min-h-11 items-center gap-2 rounded-md text-xs font-medium text-accent hover:underline focus-visible:outline-2 focus-visible:outline-ring" onClick={() => { setTable(name); setOnlyRelated(true); }}>Lihat {name}<ArrowRight size={13} aria-hidden="true" /></button>)}</div>
      </div>}
      <CampusRecordTable dataset={dataset} table={table} rows={rows} selection={selected} related={related} onSelect={chooseRecord} />
    </section>
    {!selected && <p className="text-xs leading-5 text-muted-foreground">Pilih primary key pada record untuk melihat data yang terhubung.</p>}
  </div>;
}
