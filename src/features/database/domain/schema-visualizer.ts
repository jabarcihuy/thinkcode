import { CAMPUS_DATASET, getDatasetTable } from "../data/datasets";
import type { DatasetSnapshot, PracticeDataset, RecordSelection, SchemaRelation } from "../data/dataset-types";
import { datasetConnections, relatedRecords, selectionKey } from "./dataset-exploration";
export type { SchemaRelation } from "../data/dataset-types";

export type Point = { x: number; y: number };
export type SchemaView = Point & { scale: number };
export type SchemaLayout = { width: number; height: number; compact: boolean; positions: Record<string, Point>; dataset: PracticeDataset };
export const NODE_WIDTH = 224;
export const NODE_HEADER_HEIGHT = 44;
export const COLUMN_HEIGHT = 44;
export const SCHEMA_RELATIONS = CAMPUS_DATASET.relations;
export type RelationId = string;

export function nodeHeight(table: string, dataset: PracticeDataset = CAMPUS_DATASET): number {
  return NODE_HEADER_HEIGHT + getDatasetTable(dataset, table).columns.length * COLUMN_HEIGHT + 2;
}

export function schemaLayout(viewportWidth: number, dataset: PracticeDataset = CAMPUS_DATASET): SchemaLayout {
  const compact = viewportWidth < 480;
  const positions: Record<string, Point> = {};
  let bottom = 24;
  if (compact) {
    for (const table of dataset.tables) { positions[table.name] = { x: 24, y: bottom }; bottom += nodeHeight(table.name, dataset) + 48; }
    return { compact, width: 280, height: bottom - 24, positions, dataset };
  }
  const presets: Record<string, Point[]> = {
    campus: [{ x: 24, y: 24 }, { x: 336, y: 156 }, { x: 24, y: 278 }],
    library: [{ x: 24, y: 24 }, { x: 336, y: 80 }],
    shop: [{ x: 24, y: 24 }, { x: 336, y: 24 }, { x: 24, y: 260 }, { x: 336, y: 260 }],
  };
  dataset.tables.forEach((table, index) => { const position = presets[dataset.id]![index]!; positions[table.name] = position; bottom = Math.max(bottom, position.y + nodeHeight(table.name, dataset)); });
  return { compact, width: 584, height: bottom + 24, positions, dataset };
}

export function columnAnchor(layout: SchemaLayout, table: string, column: string, side: "left" | "right"): Point {
  const index = getDatasetTable(layout.dataset, table).columns.findIndex((item) => item.name === column);
  if (index < 0) throw new Error("Unknown schema column");
  return { x: layout.positions[table].x + (side === "right" ? NODE_WIDTH : 0), y: layout.positions[table].y + 1 + NODE_HEADER_HEIGHT + index * COLUMN_HEIGHT + COLUMN_HEIGHT / 2 };
}

export function relationGeometry(layout: SchemaLayout, relation: SchemaRelation): { path: string; parent: Point; child: Point } {
  const parent = columnAnchor(layout, relation.parent, relation.parentColumn, "right");
  const child = columnAnchor(layout, relation.child, relation.childColumn, layout.compact || layout.positions[relation.parent]!.x === layout.positions[relation.child]!.x ? "right" : "left");
  const bend = parent.x === child.x ? parent.x + 22 : (parent.x + child.x) / 2;
  return { parent, child, path: `M ${parent.x} ${parent.y} C ${bend} ${parent.y}, ${bend} ${child.y}, ${child.x} ${child.y}` };
}

export function fitSchema(layout: SchemaLayout, width: number, height: number): SchemaView {
  const scale = Math.min(1, (width - 24) / layout.width, (height - 24) / layout.height);
  return { scale: Math.max(0.35, scale), x: (width - layout.width * scale) / 2, y: (height - layout.height * scale) / 2 };
}

export function focusSchemaTable(layout: SchemaLayout, table: string, width: number, height: number): SchemaView {
  return { scale: 1, x: (width - NODE_WIDTH) / 2 - layout.positions[table].x, y: (height - nodeHeight(table, layout.dataset)) / 2 - layout.positions[table].y };
}

export function clampSchemaView(view: SchemaView, layout: SchemaLayout, width: number, height: number): SchemaView {
  const scale = Math.min(1.5, Math.max(0.35, view.scale));
  const clamp = (value: number, extent: number, viewport: number) => Math.min(viewport - 48, Math.max(48 - extent * scale, value));
  return { scale, x: clamp(view.x, layout.width, width), y: clamp(view.y, layout.height, height) };
}

export function linkedSchemaRelations(snapshot: DatasetSnapshot, selection: RecordSelection | null, dataset: PracticeDataset = CAMPUS_DATASET): Set<RelationId> {
  const related = relatedRecords(dataset, snapshot, selection);
  const result = new Set<RelationId>();
  for (const edge of datasetConnections(dataset, snapshot)) {
    if (!related.has(selectionKey(edge.from)) || !related.has(selectionKey(edge.to))) continue;
    result.add(edge.relationId);
  }
  return result;
}

/** Conservative source highlighting; strings, comments, and quoted field names are not SQL keywords. */
export function querySourceTables(query: string, dataset: PracticeDataset = CAMPUS_DATASET): string[] {
  const tokens = query.match(/--[^\n]*|\/\*[\s\S]*?\*\/|'(?:[^']|'')*'|"(?:[^"]|"")*"|`(?:[^`]|``)*`|\[[^\]]*\]|[a-z_][a-z0-9_]*|[^\s]/gi) ?? [];
  const meaningful = tokens.filter((token) => !token.startsWith("--") && !token.startsWith("/*"));
  const tables: string[] = [];
  for (let index = 0; index < meaningful.length - 1; index++) {
    if (!/^(FROM|JOIN|INTO|UPDATE)$/i.test(meaningful[index]!)) continue;
    const identifier = meaningful[index + 1]!.replace(/^(?:"|`|\[)|(?:"|`|\])$/g, "").toLowerCase();
    const table = dataset.tables.find((item) => item.name === identifier)?.name;
    if (table && !tables.includes(table)) tables.push(table);
  }
  return tables;
}
