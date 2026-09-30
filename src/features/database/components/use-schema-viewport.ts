"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { PracticeDataset } from "../data/dataset-types";
import { clampSchemaView, fitSchema, focusSchemaTable, schemaLayout, type SchemaView } from "@/features/database/domain/schema-visualizer";

export function useSchemaViewport(selectedTable: string, dataset: PracticeDataset) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 600, height: 520 });
  const [view, setView] = useState<SchemaView>({ x: 0, y: 0, scale: 1 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ id: number; x: number; y: number; view: SchemaView } | null>(null);
  const currentTable = useRef(selectedTable);
  const focusRef = useRef<(table: string) => void>(() => {});
  const layout = schemaLayout(size.width, dataset);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width), height = Math.round(entry.contentRect.height);
      if (width <= 0 || height <= 0) return; // A closed exercise disclosure has no viewport yet.
      setSize({ width, height });
      const nextLayout = schemaLayout(width, dataset);
      setView(nextLayout.compact ? focusSchemaTable(nextLayout, currentTable.current, width, height) : fitSchema(nextLayout, width, height));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [dataset]);

  useEffect(() => {
    if (currentTable.current !== selectedTable) focusRef.current(selectedTable);
    currentTable.current = selectedTable;
  }, [selectedTable]);

  function update(next: SchemaView) { setView(clampSchemaView(next, layout, size.width, size.height)); }
  function focus(table: string) { update(focusSchemaTable(layout, table, size.width, size.height)); }
  useEffect(() => { focusRef.current = focus; });
  function zoom(delta: number) {
    const scale = Math.min(1.5, Math.max(0.35, view.scale + delta));
    const ratio = scale / view.scale;
    update({ scale, x: size.width / 2 - (size.width / 2 - view.x) * ratio, y: size.height / 2 - (size.height / 2 - view.y) * ratio });
  }
  function reset() { setView(layout.compact ? focusSchemaTable(layout, currentTable.current, size.width, size.height) : fitSchema(layout, size.width, size.height)); }
  function startPan(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, view };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }
  function movePan(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    update({ ...start.view, x: start.view.x + event.clientX - start.x, y: start.view.y + event.clientY - start.y });
  }
  function endPan() { drag.current = null; setDragging(false); }
  function panWithKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    const directions: Record<string, [number, number]> = { ArrowLeft: [36, 0], ArrowRight: [-36, 0], ArrowUp: [0, 36], ArrowDown: [0, -36] };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault(); update({ ...view, x: view.x + direction[0], y: view.y + direction[1] });
  }
  return { viewportRef, layout, view, dragging, zoom, reset, focus, fit: () => setView(fitSchema(layout, size.width, size.height)), startPan, movePan, endPan, panWithKeyboard };
}
