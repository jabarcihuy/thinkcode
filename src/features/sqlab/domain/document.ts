import { z } from "zod";
import {
  draftSchema,
  emptyDraft,
  type SchemaDraft,
} from "@/features/schema-builder/domain/schema-draft";

export const MAX_ROWS = 100;
export const MAX_DOCUMENT_BYTES = 250_000;
const cell = z.union([
  z.string().max(500),
  z.number().finite().min(-1e12).max(1e12),
  z.null(),
]);
export const sqlabDocumentSchema = z
  .object({
    version: z.literal(1),
    name: z.string().trim().min(1).max(60),
    schema: draftSchema,
    rows: z.record(
      z.string(),
      z.array(z.record(z.string(), cell)).max(MAX_ROWS),
    ),
  })
  .superRefine((doc, ctx) => {
    const issue = (message: string) =>
      ctx.addIssue({ code: "custom", message });
    const tables = doc.schema.tables;
    for (const key of Object.keys(doc.rows))
      if (!tables.some((t) => t.id === key))
        issue("Data merujuk tabel yang tidak ada.");
    for (const table of tables) {
      if (table.name.startsWith("sqlite_") || table.name.startsWith("pragma_"))
        issue("Nama tabel sistem tidak boleh digunakan.");
      const rows = doc.rows[table.id] ?? [];
      if (rows.length && !table.columns.length)
        issue("Tambahkan kolom sebelum mengisi data.");
      const pk = table.columns.find((c) => c.primary);
      const keys = new Set<string>();
      for (const row of rows) {
        if (
          Object.keys(row).some((k) => !table.columns.some((c) => c.name === k))
        )
          issue(`Kolom data ${table.name} tidak dikenal.`);
        for (const c of table.columns) {
          const v = row[c.name] ?? null;
          if (
            v !== null &&
            (c.type === "text"
              ? typeof v !== "string"
              : typeof v !== "number" ||
                (c.type === "integer" && !Number.isSafeInteger(v)))
          )
            issue(`Tipe data ${table.name}.${c.name} tidak cocok.`);
          if (c.primary && (v === null || keys.has(JSON.stringify(v))))
            issue(`Primary key ${table.name} wajib terisi dan unik.`);
          if (c.primary) keys.add(JSON.stringify(v));
        }
        if (pk && row[pk.name] === undefined)
          issue(`Primary key ${table.name} wajib terisi.`);
      }
    }
    for (const relation of doc.schema.relations) {
      const parent = tables.find((t) => t.id === relation.parentTable)!;
      const child = tables.find((t) => t.id === relation.childTable)!;
      if (!parent || !child) continue;
      const p = parent.columns.find((c) => c.id === relation.parentColumn);
      const c = child.columns.find((col) => col.id === relation.childColumn);
      if (!p || !c) continue;
      for (const row of doc.rows[child.id] ?? []) {
        const value = row[c.name];
        if (
          value !== null &&
          value !== undefined &&
          !(doc.rows[parent.id] ?? []).some((r) => r[p.name] === value)
        )
          issue(
            `Foreign key ${child.name}.${c.name} belum memiliki record rujukan.`,
          );
      }
    }
    if (
      new TextEncoder().encode(JSON.stringify(doc)).length > MAX_DOCUMENT_BYTES
    )
      issue("Database terlalu besar untuk SQLab.");
  });
export type SqlabDocument = z.infer<typeof sqlabDocumentSchema>;
export const initialDocument: SqlabDocument = {
  version: 1,
  name: "Database saya",
  schema: emptyDraft(),
  rows: {},
};
export function parseDocument(value: unknown): SqlabDocument | null {
  const parsed = sqlabDocumentSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/** Preserve data by stable column/table identity when a schema is edited. */
export function reconcileSchema(
  doc: SqlabDocument,
  schema: SchemaDraft,
): SqlabDocument {
  const rows = Object.fromEntries(
    schema.tables.map((table) => {
      const previous = doc.schema.tables.find((t) => t.id === table.id);
      return [
        table.id,
        (doc.rows[table.id] ?? []).map((row) =>
          Object.fromEntries(
            table.columns.map((column) => {
              const old = previous?.columns.find((c) => c.id === column.id);
              return [column.name, old ? (row[old.name] ?? null) : null];
            }),
          ),
        ),
      ];
    }),
  );
  return { ...doc, schema, rows };
}
export const quoteIdentifier = (name: string) =>
  `"${name.replaceAll('"', '""')}"`;
export function schemaSql(doc: SqlabDocument): string {
  return doc.schema.tables
    .filter((t) => t.columns.length)
    .map((table) => {
      const columns = table.columns.map(
        (c) =>
          `${quoteIdentifier(c.name)} ${c.type.toUpperCase()}${c.primary ? " PRIMARY KEY NOT NULL" : ""}`,
      );
      const fks = doc.schema.relations
        .filter((r) => r.childTable === table.id)
        .map((r) => {
          const p = doc.schema.tables.find((t) => t.id === r.parentTable)!;
          const pc = p.columns.find((c) => c.id === r.parentColumn)!;
          const cc = table.columns.find((c) => c.id === r.childColumn)!;
          return `FOREIGN KEY (${quoteIdentifier(cc.name)}) REFERENCES ${quoteIdentifier(p.name)} (${quoteIdentifier(pc.name)})`;
        });
      return `CREATE TABLE ${quoteIdentifier(table.name)} (${[...columns, ...fks].join(", ")});`;
    })
    .join("\n");
}
