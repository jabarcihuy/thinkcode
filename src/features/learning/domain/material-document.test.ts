import { describe, expect, it } from "vitest";
import { parseMaterialDocument } from "./material-document";

describe("reading document", () => {
  it("preserves prose, SQL, tables and video references without fetching anything", () => {
    const blocks = parseMaterialDocument("## Relasi\n\nPK → FK.\n\n```sql\nSELECT name FROM students;\n```\n\n| id | name |\n| --- | --- |\n| 1 | Alya |\n\n[Video](https://www.youtube.com/watch?v=123)");
    expect(blocks).toContainEqual({ type: "code", text: "SELECT name FROM students;" });
    expect(blocks).toContainEqual({ type: "table", rows: [["id", "name"], ["1", "Alya"]] });
    expect(blocks.at(-1)).toEqual({ type: "paragraph", text: "Video (https://www.youtube.com/watch?v=123)" });
  });
  it("ignores HTML and image resources", () => {
    expect(JSON.stringify(parseMaterialDocument('<script>fetch("private")</script>\n\n![Diagram](https://invalid/image.png)'))).not.toMatch(/fetch|image.png/);
  });
  it("limits document size", () => { expect(() => parseMaterialDocument("x".repeat(30001))).toThrow(); });
});
