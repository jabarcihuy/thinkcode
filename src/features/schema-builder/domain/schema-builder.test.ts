import { describe, expect, it } from "vitest";
import { MODELING_SCENARIOS } from "../data/scenarios";
import { draftSchema, emptyDraft, MAX_TABLES, readDraft } from "./schema-draft";
import { removeColumn, removeTable, saveColumn } from "./schema-operations";
import { modelFeedback } from "./model-feedback";
import { modelLayout, modelRelationPath } from "./diagram-layout";

const library = MODELING_SCENARIOS[0]!;
const reference = library.reference;

describe("visual schema drafts", () => {
  it("accepts empty drafts and both bounded reference models", () => {
    expect(draftSchema.safeParse(emptyDraft()).success).toBe(true);
    for (const scenario of MODELING_SCENARIOS) expect(readDraft(JSON.stringify(scenario.reference))).toEqual(scenario.reference);
  });
  it("rejects oversized, corrupt, wrong-version, duplicate-name and duplicate-id storage", () => {
    expect(readDraft("{")).toBeNull();
    expect(readDraft(" ".repeat(50_001))).toBeNull();
    expect(readDraft(JSON.stringify({ ...reference, version: 2 }))).toBeNull();
    expect(draftSchema.safeParse({ ...reference, tables: [...reference.tables, reference.tables[0]] }).success).toBe(false);
    expect(draftSchema.safeParse({ ...reference, tables: Array(MAX_TABLES + 1).fill(reference.tables[0]) }).success).toBe(false);
    expect(draftSchema.safeParse({ ...reference, tables: reference.tables.map((table) => ({ ...table, name: "same" })) }).success).toBe(false);
  });
  it("rejects script/SQL identifiers rather than treating them as executable definitions", () => {
    for (const name of ["<script>", "DROP TABLE x", "name;", " ", "école"]) {
      expect(draftSchema.safeParse({ ...reference, tables: [{ ...reference.tables[0], name }] }).success).toBe(false);
    }
  });
  it("rejects missing endpoints, mismatched types, self-links and duplicate foreign keys", () => {
    const relation = reference.relations[0]!;
    for (const patch of [{ parentColumn: "missing" }, { parentColumn: "member-name" }, { childColumn: "loan-id" }, { childTable: "members", childColumn: "member-name" }]) {
      expect(draftSchema.safeParse({ ...reference, relations: [{ ...relation, ...patch }] }).success).toBe(false);
    }
    const changed = { ...reference, tables: reference.tables.map((table) => ({ ...table, columns: table.columns.map((column) => column.id === "loan-member" ? { ...column, type: "text" } : column) })) };
    expect(draftSchema.safeParse(changed).success).toBe(false);
    expect(draftSchema.safeParse({ ...reference, relations: [...reference.relations, { ...relation, id: "duplicate-link" }] }).success).toBe(false);
  });
  it("removes dangling relationships when a table or column is deleted", () => {
    const tableRemoved = removeTable(reference, "members");
    expect(tableRemoved.relations).toHaveLength(1);
    expect(draftSchema.safeParse(tableRemoved).success).toBe(true);
    const columnRemoved = removeColumn(reference, "loans", "loan-member");
    expect(columnRemoved.relations).toHaveLength(1);
    expect(draftSchema.safeParse(columnRemoved).success).toBe(true);
  });
  it("replaces a PK and removes stale links; an FK type change also detaches its link", () => {
    const rekeyed = saveColumn(reference, "members", { id: "member-name", name: "name", type: "text", primary: true });
    expect(rekeyed.tables[0]!.columns.filter((column) => column.primary).map((column) => column.id)).toEqual(["member-name"]);
    expect(rekeyed.relations).toHaveLength(1);
    expect(draftSchema.safeParse(rekeyed).success).toBe(true);
    const typed = saveColumn(reference, "loans", { id: "loan-member", name: "member_id", type: "text", primary: false });
    expect(typed.relations).toHaveLength(1);
    expect(draftSchema.safeParse(typed).success).toBe(true);
  });
});

describe("modeling feedback and mobile diagrams", () => {
  it("gives a next step for empty and incomplete models without assigning a score", () => {
    expect(modelFeedback(emptyDraft(), library)[0]).toContain("Mulai");
    expect(modelFeedback({ version: 1, tables: [{ id: "x", name: "members", columns: [] }], relations: [] }, library).join(" ")).toContain("primary key");
    expect(modelFeedback(reference, library).join(" ")).toContain("bandingkan alasan");
  });
  it("uses one readable column on mobile and two on a wider viewport", () => {
    const mobile = modelLayout(reference, 320);
    const desktop = modelLayout(reference, 800);
    expect(mobile.compact).toBe(true);
    expect(mobile.positions.members!.x).toBe(mobile.positions.books!.x);
    expect(mobile.positions.loans!.y).toBeGreaterThan(mobile.positions.books!.y);
    expect(desktop.positions.members!.x).not.toBe(desktop.positions.books!.x);
    for (const layout of [mobile, desktop]) {
      const path = modelRelationPath(reference, layout, reference.relations[0]!);
      expect(path.path).not.toMatch(/NaN|undefined/);
      expect(path.to.y).toBe(layout.positions.loans!.y + 44 * 2.5);
    }
  });
});
