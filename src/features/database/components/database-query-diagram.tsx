"use client";

import { useState } from "react";
import { Maximize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SchemaTableNode } from "./schema-table-node";
import { useSchemaViewport } from "./use-schema-viewport";
import { CAMPUS_DATASET } from "../data/datasets";
import type { DatasetSnapshot, PracticeDataset, RecordSelection } from "../data/dataset-types";
import { initialDatasetSnapshot } from "../domain/dataset-exploration";
import { linkedSchemaRelations, querySourceTables, relationGeometry, type RelationId } from "@/features/database/domain/schema-visualizer";

export function DatabaseQueryDiagram({ query, step, snapshot: suppliedSnapshot, selectedTable, dataset = CAMPUS_DATASET, onTableSelect, recordSelection = null }: { query: string; step: number; snapshot?: DatasetSnapshot; dataset?: PracticeDataset; selectedTable?: string; onTableSelect?: (table: string) => void; recordSelection?: RecordSelection | null }) {
  const [seed] = useState(() => initialDatasetSnapshot(dataset));
  const snapshot = suppliedSnapshot ?? seed;
  const [relationId, setRelationId] = useState<RelationId | null>(null);
  const { viewportRef, layout, view, dragging, zoom, reset, focus, fit, startPan, movePan, endPan, panWithKeyboard } = useSchemaViewport(selectedTable ?? dataset.tables[0]!.name, dataset);
  const sourceTables = querySourceTables(query, dataset);
  const currentTables = new Set(step === 0 ? sourceTables.slice(0, 1) : sourceTables);
  const selectedRelation = dataset.relations.find((relation) => relation.id === relationId);
  const activeRelations = selectedRelation ? new Set([selectedRelation.id]) : linkedSchemaRelations(snapshot, recordSelection, dataset);
  const highlightedColumns = new Set(dataset.relations.filter((relation) => activeRelations.has(relation.id)).flatMap((relation) => [`${relation.parent}.${relation.parentColumn}`, `${relation.child}.${relation.childColumn}`]));

  function selectTable(table: string) { onTableSelect?.(table); focus(table); }
  function selectColumn(table: string, column: string) {
    const relation = dataset.relations.find((item) => (item.parent === table && item.parentColumn === column) || (item.child === table && item.childColumn === column));
    setRelationId(relation?.id ?? null);
    onTableSelect?.(table);
  }

  return <div role="group" aria-label="Canvas struktur tabel basis data" className="overflow-hidden rounded-lg border border-input">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted px-3 py-2">
      <span className="text-xs font-medium text-muted-foreground">Skema · {dataset.tables.length} tabel</span>
      <div role="group" aria-label="Kontrol canvas" className="flex items-center gap-1">
        <Button type="button" variant="ghost" size="sm" className="h-11 min-h-11 w-11 min-w-11 shrink-0 px-0" aria-label="Perkecil canvas" disabled={view.scale <= 0.35} onClick={() => zoom(-0.15)}><ZoomOut size={15} aria-hidden="true" /></Button>
        <span className="min-w-10 text-center text-xs tabular-nums text-muted-foreground" aria-live="polite">{Math.round(view.scale * 100)}%</span>
        <Button type="button" variant="ghost" size="sm" className="h-11 min-h-11 w-11 min-w-11 shrink-0 px-0" aria-label="Perbesar canvas" disabled={view.scale >= 1.5} onClick={() => zoom(0.15)}><ZoomIn size={15} aria-hidden="true" /></Button>
        <Button type="button" variant="ghost" size="sm" className="h-11 min-h-11 w-11 min-w-11 shrink-0 px-0" aria-label="Lihat semua tabel" title="Lihat semua tabel" onClick={fit}><Maximize2 size={15} aria-hidden="true" /></Button>
        <Button type="button" variant="ghost" size="sm" className="h-11 min-h-11 w-11 min-w-11 shrink-0 px-0" aria-label="Atur ulang" title="Atur ulang tampilan" onClick={reset}><RotateCcw size={15} aria-hidden="true" /></Button>
      </div>
    </div>
    <div ref={viewportRef} role="group" tabIndex={0} aria-label="Area skema. Pilih nama tabel untuk memusatkan; pilih kolom PK atau FK untuk membaca relasi. Gunakan tombol panah untuk menggeser."
      onPointerDown={startPan} onPointerMove={movePan} onPointerUp={endPan} onPointerCancel={endPan} onLostPointerCapture={endPan} onKeyDown={panWithKeyboard}
      className={`schema-canvas relative h-[340px] touch-pan-y select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:h-[520px] ${dragging ? "cursor-grabbing" : "cursor-grab"}`}>
      <div className="absolute left-0 top-0" style={{ width: layout.width, height: layout.height, transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, transformOrigin: "0 0" }}>
        <svg width={layout.width} height={layout.height} className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
          {dataset.relations.map((relation) => {
            const { path, parent, child } = relationGeometry(layout, relation);
            const active = activeRelations.has(relation.id);
            const color = active ? "var(--live)" : "var(--muted-foreground)";
            return <g key={relation.id}>
              <path d={path} fill="none" stroke={color} strokeWidth={active ? 2 : 1.5} />
              <path d={path} fill="none" stroke="transparent" strokeWidth={16} className="pointer-events-auto cursor-pointer" onClick={() => setRelationId(relationId === relation.id ? null : relation.id)} />
              <circle cx={parent.x} cy={parent.y} r={3} fill="var(--background)" stroke={color} strokeWidth={1.5} />
              <circle cx={child.x} cy={child.y} r={3} fill={color} />
              <text x={parent.x + 8} y={parent.y - 9} fill={color} fontSize={11}>1</text>
              <text x={child.x + (layout.compact ? 9 : -13)} y={child.y - 9} fill={color} fontSize={11}>N</text>
            </g>;
          })}
        </svg>
        {dataset.tables.map((table) => <SchemaTableNode key={table.name} tableDefinition={table} count={snapshot[table.name]!.length} position={layout.positions[table.name]!} selected={selectedTable === table.name} source={currentTables.has(table.name)} highlightedColumns={highlightedColumns} onSelect={() => selectTable(table.name)} onColumnSelect={(column) => selectColumn(table.name, column)} />)}
      </div>
    </div>
    <div className="border-t border-border bg-muted px-4 py-3">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground"><span><abbr title="Primary key: identitas unik record" className="font-semibold text-foreground no-underline">PK</abbr> primary key</span><span><abbr title="Foreign key: rujukan ke tabel lain" className="font-semibold text-foreground no-underline">FK</abbr> foreign key</span><span>1:N satu ke banyak</span></div>
      <p aria-live="polite" className="mt-2 text-xs leading-5 text-muted-foreground">{selectedRelation ? <><code className="text-foreground">{selectedRelation.parent}.{selectedRelation.parentColumn}</code> = <code className="text-foreground">{selectedRelation.child}.{selectedRelation.childColumn}</code>. {selectedRelation.explanation}</> : recordSelection && activeRelations.size ? "Relasi record yang dipilih disorot. Pilih key untuk melihat pasangan kolomnya." : "Pilih PK atau FK untuk membaca hubungan kolom antartabel."}</p>
    </div>
  </div>;
}
