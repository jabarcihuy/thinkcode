import { describe, it, expect } from "vitest";
import {
  initialDocument,
  sqlabDocumentSchema,
  schemaSql,
  reconcileSchema,
} from "./document";
import { querySchema } from "./query";
import { PRACTICE_DATASETS } from "@/features/database/data/datasets";
import { documentFromDataset } from "./templates";
import { fixture } from "./test-fixture";
describe("SQLab document", () => {
  it("accepts empty editable schema and complete dataset", () => {
    expect(sqlabDocumentSchema.safeParse(initialDocument).success).toBe(true);
    expect(sqlabDocumentSchema.safeParse(fixture).success).toBe(true);
  });
  it("rejects duplicate primary keys, invalid types and excessive rows", () => {
    for (const rows of [
      [{ id: 1 }, { id: 1 }],
      [{ id: "abc" }],
      Array.from({ length: 101 }, (_, id) => ({ id })),
    ])
      expect(
        sqlabDocumentSchema.safeParse({ ...fixture, rows: { t: rows } })
          .success,
      ).toBe(false);
  });
  it("rejects missing foreign records", () => {
    const doc = structuredClone(fixture);
    doc.schema.tables.push({
      id: "u",
      name: "loans",
      columns: [{ id: "fk", name: "book_id", type: "integer", primary: false }],
    });
    doc.schema.relations.push({
      id: "r",
      parentTable: "t",
      parentColumn: "id",
      childTable: "u",
      childColumn: "fk",
    });
    doc.rows.u = [{ book_id: 2 }];
    expect(sqlabDocumentSchema.safeParse(doc).success).toBe(false);
    doc.rows.u = [{ book_id: 1 }];
    expect(sqlabDocumentSchema.safeParse(doc).success).toBe(true);
  });
  it("denies reserved system tables and extra row columns", () => {
    const doc = structuredClone(fixture);
    doc.schema.tables[0]!.name = "sqlite_master";
    expect(sqlabDocumentSchema.safeParse(doc).success).toBe(false);
    expect(
      sqlabDocumentSchema.safeParse({
        ...fixture,
        rows: { t: [{ id: 1, secret: "x" }] },
      }).success,
    ).toBe(false);
  });
  it("preserves values on column rename and quotes generated DDL", () => {
    const schema = structuredClone(fixture.schema);
    schema.tables[0]!.columns[1]!.name = "label";
    expect(reconcileSchema(fixture, schema).rows.t).toEqual([
      { id: 1, label: "Book" },
    ]);
    expect(schemaSql(fixture)).toContain(
      'CREATE TABLE "books" ("id" INTEGER PRIMARY KEY NOT NULL',
    );
  });
});
describe("SQLab query boundary", () => {
  it("permits single local SELECT and bounded DML", () => {
    for (const sql of [
      "SELECT * FROM books;",
      "INSERT INTO books VALUES (2, 'a;b');",
      "UPDATE books SET title='New'",
      "DELETE FROM books WHERE id=2",
    ])
      expect(querySchema.safeParse(sql).success).toBe(true);
  });
  it("rejects multiple statements, DDL, pragma and oversized queries", () => {
    for (const sql of [
      "SELECT 1; DELETE FROM books",
      "PRAGMA user_version",
      "ATTACH 'x' AS x",
      "CREATE TABLE x(id)",
      "SELECT 1 -- comment",
      "SELECT '" + "x".repeat(4096) + "'",
    ])
      expect(querySchema.safeParse(sql).success).toBe(false);
  });
});

it("preserves all existing dataset templates as editable custom documents", () => {
  for (const dataset of PRACTICE_DATASETS)
    expect(
      sqlabDocumentSchema.safeParse(documentFromDataset(dataset)).success,
    ).toBe(true);
});
