import { describe, expect, it } from "vitest";
import { schemaMatches } from "./grade-schema";
import { parseSubmission } from "../validation/submission";
import { MODELING_SCENARIOS } from "@/features/schema-builder/data/scenarios";
const draft = MODELING_SCENARIOS[0]!.reference;
const expected = {
  tables: Object.fromEntries(draft.tables.map((table) => [table.name, Object.fromEntries(table.columns.map((column) => [column.name, { type: column.type, primary: column.primary }]))])),
  relations: [["members", "member_id", "loans", "member_id"], ["books", "book_id", "loans", "book_id"]],
};
describe("trusted schema core", () => {
  it("accepts the correct table/column/PK/FK model with arbitrary editor IDs", () => {
    expect(schemaMatches(draft, expected)).toBe(true);
    const renamed = structuredClone(draft);
    renamed.tables[0]!.id = "new-id";
    renamed.relations[0]!.parentTable = "new-id";
    expect(schemaMatches(renamed, expected)).toBe(true);
  });
  it("rejects count-only models, missing FK, wrong type and wrong PK", () => {
    for (const mutate of [
      (value: typeof draft) => { value.tables[0]!.name = "wrong"; },
      (value: typeof draft) => { value.relations.pop(); },
      (value: typeof draft) => { value.tables[0]!.columns[0]!.type = "text"; },
      (value: typeof draft) => { value.tables[0]!.columns[0]!.primary = false; },
    ]) { const value = structuredClone(draft); mutate(value); expect(schemaMatches(value, expected)).toBe(false); }
  });
  it("bounds and validates untrusted model submissions", () => {
    expect(parseSubmission("FLOWCHART", { pathSlug: "database-fundamentals", answer: { schema: draft } })).not.toBeNull();
    expect(parseSubmission("FLOWCHART", { pathSlug: "database-fundamentals", answer: { schema: { ...draft, tables: Array(7).fill(draft.tables[0]) } } })).toBeNull();
  });
});
