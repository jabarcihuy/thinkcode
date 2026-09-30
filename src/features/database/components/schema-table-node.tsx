"use client";

import { KeyRound, Link2, Table2 } from "lucide-react";
import type { DatasetTable } from "../data/dataset-types";
import { COLUMN_HEIGHT, NODE_HEADER_HEIGHT, NODE_WIDTH, type Point } from "@/features/database/domain/schema-visualizer";

type Props = { tableDefinition: DatasetTable; count: number; position: Point; selected: boolean; source: boolean; highlightedColumns: Set<string>; onSelect: () => void; onColumnSelect: (column: string) => void };

export function SchemaTableNode({ tableDefinition, count, position, selected, source, highlightedColumns, onSelect, onColumnSelect }: Props) {
  const table = tableDefinition.name;
  return <section aria-label={`Tabel ${table}`} className={`absolute overflow-hidden rounded-lg border bg-background ${selected ? "border-muted-foreground" : "border-input"}`} style={{ left: position.x, top: position.y, width: NODE_WIDTH }}>
    <button type="button" onClick={onSelect} aria-pressed={selected} aria-label={`Lihat record ${table}`} className="flex w-full items-center gap-2.5 border-b border-input bg-secondary px-3 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring" style={{ height: NODE_HEADER_HEIGHT }}>
      <Table2 size={15} aria-hidden="true" className="shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate font-mono text-[13px] font-semibold">{table}</span>
      {source && <span className="shrink-0 text-[11px] font-medium text-accent">Query</span>}<span title={`${count} record`} className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{count}</span>
    </button>
    <ul>
      {tableDefinition.columns.map((column) => {
        const highlighted = highlightedColumns.has(`${table}.${column.name}`);
        return <li key={column.name}>
          <button type="button" onClick={() => onColumnSelect(column.name)} aria-label={`${table}.${column.name}, ${column.type}${column.key ? `, ${column.key === "PK" ? "primary key" : "foreign key"}` : ""}`} aria-pressed={highlighted} className={`flex w-full items-center gap-2 border-b border-border px-3 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring ${highlighted ? "bg-live-surface" : ""}`} style={{ height: COLUMN_HEIGHT }}>
            {column.key === "PK" ? <KeyRound size={12} aria-hidden="true" className="shrink-0 text-accent" /> : column.key === "FK" ? <Link2 size={12} aria-hidden="true" className="shrink-0 text-muted-foreground" /> : <span className="w-3 shrink-0" aria-hidden="true" />}
            <span className="flex-1 font-mono text-xs">{column.name}</span>
            {column.key && <span className="text-[10px] font-medium text-muted-foreground">{column.key}</span>}
            <span className="text-[11px] text-muted-foreground">{column.type}</span>
          </button>
        </li>;
      })}
    </ul>
  </section>;
}
