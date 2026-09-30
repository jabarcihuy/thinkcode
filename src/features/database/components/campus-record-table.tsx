"use client";

import { Check, Circle, Link2 } from "lucide-react";
import { getDatasetTable } from "../data/datasets";
import type { PracticeDataset, RecordSelection } from "../data/dataset-types";
import { recordId, recordLabel, selectionKey } from "../domain/dataset-exploration";
import type { SqliteRow } from "@/features/database/domain/sql-query";

type Props = { table: string; dataset: PracticeDataset; rows: SqliteRow[]; selection: RecordSelection | null; related: Set<string>; onSelect: (selection: RecordSelection | null) => void };

export function CampusRecordTable({ table, dataset, rows, selection, related, onSelect }: Props) {
  return <div className="overflow-x-auto">
    <table className="w-full min-w-[26rem] border-collapse text-left text-sm">
      <caption className="sr-only">Record {table}. Pilih primary key pada record untuk menelusuri relasinya.</caption>
      <thead><tr className="border-b border-border bg-muted text-muted-foreground">{getDatasetTable(dataset, table).columns.map((column) => <th scope="col" key={column.name} className="px-4 py-3 font-medium"><span className="font-mono text-xs">{column.name}</span>{column.key && <span className="ml-1.5 text-[10px]">{column.key}</span>}</th>)}</tr></thead>
      <tbody>{rows.map((row) => {
        const record = { table, id: recordId(dataset, table, row) };
        const key = selectionKey(record);
        const isSelected = Boolean(selection && key === selectionKey(selection));
        const isRelated = related.has(key);
        return <tr key={key} className={`border-b border-border last:border-0 ${isSelected ? "bg-live-surface" : isRelated ? "bg-secondary" : "hover:bg-muted/60"}`}>
          {getDatasetTable(dataset, table).columns.map((column) => column.key === "PK"
            ? <th key={column.name} scope="row" className="px-2 font-normal"><button type="button" aria-label={`Pilih ${table} ${record.id}: ${recordLabel(dataset, table, row)}${isRelated && !isSelected ? ", terkait" : ""}`} aria-pressed={isSelected} onClick={() => onSelect(isSelected ? null : record)} className="flex min-h-11 w-full items-center gap-2.5 rounded-md px-2 font-mono text-xs tabular-nums focus-visible:outline-2 focus-visible:outline-ring">{isSelected ? <Check size={13} aria-hidden="true" className="text-accent" /> : isRelated ? <Link2 size={13} aria-hidden="true" className="text-foreground" /> : <Circle size={13} aria-hidden="true" className="text-muted-foreground" />}{String(row[column.name] ?? "NULL")}</button></th>
            : <td key={column.name} className="px-4 py-3 font-mono text-xs tabular-nums">{String(row[column.name] ?? "NULL")}</td>)}
        </tr>;
      })}</tbody>
    </table>
    {rows.length === 0 && <p className="px-4 py-8 text-sm text-muted-foreground">Tidak ada record pada tampilan ini.</p>}
  </div>;
}
