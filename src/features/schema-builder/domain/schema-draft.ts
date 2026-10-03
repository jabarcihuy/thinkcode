import { z } from "zod";

export const MAX_TABLES = 6;
export const MAX_COLUMNS = 8;
export const MAX_RELATIONS = 12;
export const identifierSchema = z.string().trim().regex(/^[a-z_][a-z0-9_]{0,29}$/, "Gunakan huruf kecil, angka, atau garis bawah; awali dengan huruf.");
export const columnSchema = z.object({
  id: z.string().min(1).max(80),
  name: identifierSchema,
  type: z.enum(["integer", "text", "real"]),
  primary: z.boolean(),
});
export const draftSchema = z.object({
  version: z.literal(1),
  tables: z.array(z.object({ id: z.string().min(1).max(80), name: identifierSchema, columns: z.array(columnSchema).max(MAX_COLUMNS) })).max(MAX_TABLES),
  relations: z.array(z.object({
    id: z.string().min(1).max(80), parentTable: z.string().max(80), parentColumn: z.string().max(80), childTable: z.string().max(80), childColumn: z.string().max(80),
  })).max(MAX_RELATIONS),
}).superRefine((draft, ctx) => {
  const ids = [...draft.tables.flatMap((table) => [table.id, ...table.columns.map((column) => column.id)]), ...draft.relations.map((relation) => relation.id)];
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "Identitas objek harus unik." });
  if (new Set(draft.tables.map((table) => table.name)).size !== draft.tables.length) ctx.addIssue({ code: "custom", message: "Nama tabel harus berbeda." });
  for (const table of draft.tables) {
    if (new Set(table.columns.map((column) => column.name)).size !== table.columns.length) ctx.addIssue({ code: "custom", message: `Nama kolom di ${table.name} harus berbeda.` });
    if (table.columns.filter((column) => column.primary).length > 1) ctx.addIssue({ code: "custom", message: "Pilih satu primary key per tabel." });
  }
  const links = new Set<string>();
  for (const relation of draft.relations) {
    const parent = draft.tables.find((table) => table.id === relation.parentTable)?.columns.find((column) => column.id === relation.parentColumn);
    const child = draft.tables.find((table) => table.id === relation.childTable)?.columns.find((column) => column.id === relation.childColumn);
    const key = `${relation.childTable}:${relation.childColumn}`;
    if (!parent?.primary || !child || child.primary || parent.type !== child.type || relation.parentTable === relation.childTable || links.has(key)) {
      ctx.addIssue({ code: "custom", message: "Hubungkan satu foreign key ke primary key tabel lain dengan tipe yang sama." });
    }
    links.add(key);
  }
});

export type SchemaDraft = z.infer<typeof draftSchema>;
export type ModelTable = SchemaDraft["tables"][number];
export type ModelColumn = z.infer<typeof columnSchema>;
export type ModelRelation = SchemaDraft["relations"][number];
export const emptyDraft = (): SchemaDraft => ({ version: 1, tables: [], relations: [] });

export function readDraft(raw: string | null): SchemaDraft | null {
  if (!raw || raw.length > 50_000) return null;
  try {
    const parsed = draftSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch { return null; }
}
