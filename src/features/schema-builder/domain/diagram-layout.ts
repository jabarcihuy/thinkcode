import type { ModelRelation, SchemaDraft } from "./schema-draft";

export const TABLE_WIDTH = 244;
export const ROW_HEIGHT = 44;
export function modelLayout(draft: SchemaDraft, viewportWidth: number) {
  const compact = viewportWidth < 600;
  const columns = compact ? 1 : 2;
  const positions: Record<string, { x: number; y: number }> = {};
  let rowY = 24;
  for (let i = 0; i < draft.tables.length; i += columns) {
    const row = draft.tables.slice(i, i + columns);
    row.forEach((table, index) => { positions[table.id] = { x: 24 + index * 324, y: rowY }; });
    rowY += Math.max(...row.map((table) => ROW_HEIGHT * (Math.max(1, table.columns.length) + 1) + 2)) + 64;
  }
  return { positions, compact, width: compact ? 312 : 636, height: Math.max(260, rowY - 40) };
}

export function modelRelationPath(draft: SchemaDraft, layout: ReturnType<typeof modelLayout>, relation: ModelRelation) {
  const parent = draft.tables.find((table) => table.id === relation.parentTable)!;
  const child = draft.tables.find((table) => table.id === relation.childTable)!;
  const parentPos = layout.positions[parent.id]!;
  const childPos = layout.positions[child.id]!;
  const sameColumn = parentPos.x === childPos.x;
  const from = { x: parentPos.x + TABLE_WIDTH, y: parentPos.y + ROW_HEIGHT * (parent.columns.findIndex((column) => column.id === relation.parentColumn) + 1.5) };
  const to = { x: childPos.x + (sameColumn ? TABLE_WIDTH : 0), y: childPos.y + ROW_HEIGHT * (child.columns.findIndex((column) => column.id === relation.childColumn) + 1.5) };
  const bend = sameColumn ? from.x + 28 : (from.x + to.x) / 2;
  return { path: `M ${from.x} ${from.y} C ${bend} ${from.y}, ${bend} ${to.y}, ${to.x} ${to.y}`, from, to };
}
