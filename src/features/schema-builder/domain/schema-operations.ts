import type { ModelColumn, SchemaDraft } from "./schema-draft";

export function removeTable(draft: SchemaDraft, id: string): SchemaDraft {
  return { ...draft, tables: draft.tables.filter((table) => table.id !== id), relations: draft.relations.filter((relation) => relation.parentTable !== id && relation.childTable !== id) };
}

export function removeColumn(draft: SchemaDraft, tableId: string, columnId: string): SchemaDraft {
  return { ...draft, tables: draft.tables.map((table) => table.id === tableId ? { ...table, columns: table.columns.filter((column) => column.id !== columnId) } : table), relations: draft.relations.filter((relation) => relation.parentColumn !== columnId && relation.childColumn !== columnId) };
}

export function saveColumn(draft: SchemaDraft, tableId: string, column: ModelColumn): SchemaDraft {
  const table = draft.tables.find((item) => item.id === tableId);
  if (!table) return draft;
  const columns = table.columns.some((item) => item.id === column.id)
    ? table.columns.map((item) => item.id === column.id ? column : item)
    : [...table.columns, column];
  const previousPrimary = table.columns.find((item) => item.primary);
  const nextColumns = columns.map((item) => column.primary && item.id !== column.id ? { ...item, primary: false } : item);
  const changedIdentity = previousPrimary?.id !== nextColumns.find((item) => item.primary)?.id;
  return {
    ...draft,
    tables: draft.tables.map((item) => item.id === tableId ? { ...item, columns: nextColumns } : item),
    relations: draft.relations.filter((relation) => {
      // A changed key/type removes its link so the learner can explicitly reconnect it.
      if (changedIdentity && relation.parentTable === tableId) return false;
      if (relation.parentColumn === column.id || relation.childColumn === column.id) {
        const otherId = relation.parentColumn === column.id ? relation.childColumn : relation.parentColumn;
        const other = draft.tables.flatMap((item) => item.columns).find((item) => item.id === otherId);
        if (relation.childColumn === column.id && column.primary) return false;
        return other?.type === column.type;
      }
      return true;
    }),
  };
}
