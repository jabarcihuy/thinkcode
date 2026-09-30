import { getDatasetTable, primaryKey } from "../data/datasets";
import type { DatasetSnapshot, PracticeDataset, RecordSelection } from "../data/dataset-types";
import type { SqliteRow } from "./sql-query";

export function initialDatasetSnapshot(dataset: PracticeDataset): DatasetSnapshot {
  return Object.fromEntries(dataset.tables.map((table) => [table.name, table.rows.map((row) => ({ ...row }))]));
}
export function recordId(dataset: PracticeDataset, table: string, row: SqliteRow): number { return Number(row[primaryKey(getDatasetTable(dataset, table))]); }
export function recordLabel(dataset: PracticeDataset, table: string, row: SqliteRow): string { return String(row[getDatasetTable(dataset, table).labelColumn] ?? ""); }
export function selectionKey(selection: RecordSelection): string { return `${selection.table}:${selection.id}`; }
export function datasetConnections(dataset: PracticeDataset, snapshot: DatasetSnapshot): { from: RecordSelection; to: RecordSelection; relationId: string }[] {
  return dataset.relations.flatMap((relation) => (snapshot[relation.child] ?? []).flatMap((row) => {
    const parent = (snapshot[relation.parent] ?? []).find((item) => item[relation.parentColumn] === row[relation.childColumn]);
    return parent ? [{ from: { table: relation.child, id: recordId(dataset, relation.child, row) }, to: { table: relation.parent, id: recordId(dataset, relation.parent, parent) }, relationId: relation.id }] : [];
  }));
}
/** Follow outward from a selected entity; never travel back through siblings of an already visited table. */
export function relatedRecords(dataset: PracticeDataset, snapshot: DatasetSnapshot, selection: RecordSelection | null): Set<string> {
  if (!selection || !(snapshot[selection.table] ?? []).some((row) => recordId(dataset, selection.table, row) === selection.id)) return new Set();
  const connections = datasetConnections(dataset, snapshot);
  const related = new Set([selectionKey(selection)]);
  let frontier = [selection];
  const visitedTables = new Set([selection.table]);
  while (frontier.length) {
    const next = new Map<string, RecordSelection>();
    for (const current of frontier) for (const edge of connections) {
      const other = selectionKey(edge.from) === selectionKey(current) ? edge.to : selectionKey(edge.to) === selectionKey(current) ? edge.from : null;
      if (other && !visitedTables.has(other.table)) next.set(selectionKey(other), other);
    }
    frontier = [...next.values()];
    for (const item of frontier) { related.add(selectionKey(item)); visitedTables.add(item.table); }
  }
  return related;
}
export function applyDatasetMutation(dataset: PracticeDataset, snapshot: DatasetSnapshot, table: string, rows: SqliteRow[]): DatasetSnapshot {
  if (!dataset.tables.some((item) => item.name === table)) return snapshot;
  return { ...snapshot, [table]: rows.map((row) => ({ ...row })) };
}
