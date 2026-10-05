import { z } from "zod";
import { draftSchema, identifierSchema, type SchemaDraft } from "@/features/schema-builder/domain/schema-draft";

export const expectedSchema = z.object({
  tables: z.record(identifierSchema, z.record(identifierSchema, z.object({ type: z.enum(["integer", "text", "real"]), primary: z.boolean() }).strict()).refine((columns) => Object.values(columns).filter((column) => column.primary).length === 1)),
  relations: z.array(z.tuple([identifierSchema, identifierSchema, identifierSchema, identifierSchema])).max(12),
}).superRefine((value, context) => {
  const tables = Object.entries(value.tables).map(([name, columns]) => ({ id: name, name, columns: Object.entries(columns).map(([column, spec]) => ({ id: `${name}-${column}`, name: column, ...spec })) }));
  const relations = value.relations.map(([pt, pc, ct, cc], i) => ({ id: `edge-${i}`, parentTable: pt, parentColumn: `${pt}-${pc}`, childTable: ct, childColumn: `${ct}-${cc}` }));
  if (!tables.length || !draftSchema.safeParse({ version: 1, tables, relations }).success) context.addIssue({ code: "custom", message: "Invalid expected relational model" });
});

/** Compare semantic names/keys/edges; generated editor IDs have no grading meaning. */
export function schemaMatches(draft: SchemaDraft, expected: unknown): boolean {
  const parsed = expectedSchema.safeParse(expected);
  if (!parsed.success) throw new Error("Invalid schema grading configuration");
  const model = parsed.data;
  if (draft.tables.length !== Object.keys(model.tables).length || draft.relations.length !== model.relations.length) return false;
  for (const [name, columns] of Object.entries(model.tables)) {
    const table = draft.tables.find((item) => item.name === name);
    if (!table || table.columns.length !== Object.keys(columns).length) return false;
    for (const [columnName, spec] of Object.entries(columns)) {
      const column = table.columns.find((item) => item.name === columnName);
      if (!column || column.type !== spec.type || column.primary !== spec.primary) return false;
    }
  }
  const edges = draft.relations.map((relation) => {
    const parent = draft.tables.find((table) => table.id === relation.parentTable);
    const child = draft.tables.find((table) => table.id === relation.childTable);
    return [parent?.name, parent?.columns.find((column) => column.id === relation.parentColumn)?.name,
      child?.name, child?.columns.find((column) => column.id === relation.childColumn)?.name].join(":");
  });
  return model.relations.every((edge) => edges.includes(edge.join(":")));
}
