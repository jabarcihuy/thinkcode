"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { modelLayout, modelRelationPath, ROW_HEIGHT, TABLE_WIDTH } from "../domain/diagram-layout";
import type { SchemaDraft } from "../domain/schema-draft";

export function ModelDiagram({ draft }: { draft: SchemaDraft }) {
  const titleId = useId();
  const focusId = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [zoom, setZoom] = useState(1);
  const layout = modelLayout(draft, width);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => { if (entry.contentRect.width > 0) setWidth(entry.contentRect.width); });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  function focus(id: string) {
    const position = layout.positions[id];
    if (!position) return;
    viewport.current?.scrollTo({ left: Math.max(0, position.x * zoom - 12), top: Math.max(0, position.y * zoom - 12), behavior: "instant" });
  }
  return <section aria-labelledby={titleId}>
    <h2 id={titleId} className="text-lg font-semibold">Diagram skema</h2>
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" className="px-3" aria-label="Perkecil diagram" disabled={zoom <= 0.75} onClick={() => setZoom((value) => Math.max(0.75, value - 0.25))}><Minus size={16} aria-hidden="true" /></Button>
      <span className="min-w-11 text-center text-sm tabular-nums" aria-live="polite">{Math.round(zoom * 100)}%</span>
      <Button type="button" variant="outline" className="px-3" aria-label="Perbesar diagram" disabled={zoom >= 1.5} onClick={() => setZoom((value) => Math.min(1.5, value + 0.25))}><Plus size={16} aria-hidden="true" /></Button>
      <Button type="button" variant="ghost" className="px-3" onClick={() => { setZoom(1); viewport.current?.scrollTo({ top: 0, left: 0 }); }}><RotateCcw size={15} aria-hidden="true" />Atur ulang</Button>
    </div>
    {draft.tables.length > 0 && <div className="mt-4"><Label htmlFor={focusId}>Fokus tabel</Label><Select id={focusId} className="mt-2" value="" onChange={(event) => focus(event.target.value)}><option value="" disabled>Pilih tabel untuk melihat kolomnya</option>{draft.tables.map((table) => <option value={table.id} key={table.id}>{table.name}</option>)}</Select></div>}
    <div ref={viewport} tabIndex={0} role="region" aria-label="Diagram skema, geser untuk menjelajahi tabel" className="mt-4 h-[420px] max-w-full overflow-auto rounded-lg border border-border bg-secondary/40 focus-visible:outline-2 focus-visible:outline-ring lg:h-[560px]">
      {draft.tables.length ? <div className="relative" style={{ width: layout.width * zoom, height: layout.height * zoom }}>
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: layout.width, height: layout.height, transform: `scale(${zoom})` }}>
          <svg aria-hidden="true" className="pointer-events-none absolute inset-0 text-muted-foreground" width={layout.width} height={layout.height}>
            {draft.relations.map((relation) => { const geometry = modelRelationPath(draft, layout, relation); return <g key={relation.id}><path d={geometry.path} fill="none" stroke="currentColor" strokeWidth={1.5} /><circle cx={geometry.from.x} cy={geometry.from.y} r={3} fill="currentColor" /><circle cx={geometry.to.x} cy={geometry.to.y} r={3} fill="currentColor" /></g>; })}
          </svg>
          {draft.tables.map((table) => <section key={table.id} aria-label={`Tabel ${table.name}`} className="absolute overflow-hidden rounded-lg border border-border bg-background" style={{ ...{ left: layout.positions[table.id]!.x, top: layout.positions[table.id]!.y }, width: TABLE_WIDTH }}>
            <h3 className="flex items-center border-b border-border bg-secondary px-3 font-mono text-sm font-semibold" style={{ height: ROW_HEIGHT }}>{table.name}</h3>
            <ul>{table.columns.map((column) => <li key={column.id} className="flex items-center gap-2 border-b border-border px-3 last:border-b-0" style={{ height: ROW_HEIGHT }}><span className="min-w-0 flex-1 truncate font-mono text-xs" title={column.name}>{column.name}</span><span className="text-xs font-medium text-accent">{column.primary ? "PK" : draft.relations.some((relation) => relation.childColumn === column.id) ? "FK" : ""}</span><span className="text-xs text-muted-foreground">{column.type}</span></li>)}</ul>
            {!table.columns.length && <p className="flex items-center px-3 text-xs text-muted-foreground" style={{ height: ROW_HEIGHT }}>Belum ada kolom</p>}
          </section>)}
        </div>
      </div> : <p className="p-6 text-sm leading-6 text-muted-foreground">Diagram akan muncul setelah kamu menambahkan tabel di tab Susun.</p>}
    </div>
    <p className="mt-3 text-xs leading-5 text-muted-foreground">PK: primary key · FK: foreign key. Garis menghubungkan kolom rujukan dengan identitas yang dituju.</p>
    <details className="mt-3 border-t border-border pt-2">
      <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring">Hubungan antartabel ({draft.relations.length})</summary>
      {draft.relations.length ? <ul className="mt-2 space-y-3">{draft.relations.map((relation) => {
        const parent = draft.tables.find((table) => table.id === relation.parentTable)!;
        const child = draft.tables.find((table) => table.id === relation.childTable)!;
        return <li key={relation.id} className="text-xs leading-5"><p className="break-all font-mono">{child.name}.{child.columns.find((column) => column.id === relation.childColumn)!.name} → {parent.name}.{parent.columns.find((column) => column.id === relation.parentColumn)!.name}</p><p className="mt-1 text-muted-foreground">Satu record {parent.name} dapat dirujuk banyak record {child.name}.</p></li>;
      })}</ul> : <p className="mt-2 text-sm leading-6 text-muted-foreground">Belum ada relasi. Hubungkan FK ke PK tabel lain di tab Susun.</p>}
    </details>
  </section>;
}
