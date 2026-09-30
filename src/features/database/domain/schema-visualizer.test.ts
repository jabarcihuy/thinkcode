import { describe, expect, it } from "vitest";
import { CAMPUS_DATASET, getDatasetTable } from "../data/datasets";
import { initialDatasetSnapshot } from "./dataset-exploration";
const CAMPUS_TABLES = CAMPUS_DATASET.tables.map((table) => table.name);
import { clampSchemaView, COLUMN_HEIGHT, columnAnchor, fitSchema, focusSchemaTable, linkedSchemaRelations, querySourceTables, NODE_HEADER_HEIGHT, NODE_WIDTH, nodeHeight, relationGeometry, SCHEMA_RELATIONS, schemaLayout } from "./schema-visualizer";

describe("2D schema relationships", () => {
  it("highlights sources without treating a string or comment as a table", () => {
    expect(querySourceTables("SELECT name FROM students WHERE name = 'FROM courses' -- JOIN enrollments")).toEqual(["students"]);
    expect(querySourceTables('SELECT "FROM courses" FROM "students" JOIN enrollments ON enrollments.student_id = students.student_id')).toEqual(["students", "enrollments"]);
  });
  it("highlights targeted write tables and deduplicates sources", () => {
    expect(querySourceTables("UPDATE enrollments SET score = 78 WHERE enrollment_id = 3")).toEqual(["enrollments"]);
    expect(querySourceTables("SELECT * FROM courses JOIN courses ON courses.course_id = courses.course_id")).toEqual(["courses"]);
  });
  it("highlights actual relation paths for a selected record", () => {
    expect([...linkedSchemaRelations(initialDatasetSnapshot(CAMPUS_DATASET), { table: "students", id: 1 })].sort()).toEqual(["course-enrollments", "student-enrollments"]);
    expect(linkedSchemaRelations(initialDatasetSnapshot(CAMPUS_DATASET), { table: "students", id: 99 }).size).toBe(0);
  });
  it("does not highlight nonexistent FK paths after local deletion", () => {
    const seed = initialDatasetSnapshot(CAMPUS_DATASET);
    seed.enrollments = [];
    expect(linkedSchemaRelations(seed, { table: "courses", id: 10 }).size).toBe(0);
  });
  it("connects foreign keys to the matching primary key", () => {
    for (const relation of SCHEMA_RELATIONS) {
      expect(getDatasetTable(CAMPUS_DATASET, relation.parent).columns.find((column) => column.name === relation.parentColumn)?.key).toBe("PK");
      expect(getDatasetTable(CAMPUS_DATASET, relation.child).columns.find((column) => column.name === relation.childColumn)?.key).toBe("FK");
      expect(relation.childColumn).toBe(relation.parentColumn);
    }
  });
  it.each([360, 768, 1280])("anchors lines on the named column rows at width %s", (width) => {
    const layout = schemaLayout(width);
    for (const relation of SCHEMA_RELATIONS) {
      const geometry = relationGeometry(layout, relation);
      const index = getDatasetTable(CAMPUS_DATASET, relation.child).columns.findIndex((column) => column.name === relation.childColumn);
      expect(geometry.child.y).toBe(layout.positions.enrollments.y + 1 + NODE_HEADER_HEIGHT + index * COLUMN_HEIGHT + COLUMN_HEIGHT / 2);
      expect(geometry.parent).toEqual(columnAnchor(layout, relation.parent, relation.parentColumn, "right"));
      expect(geometry.path).toContain(`M ${geometry.parent.x} ${geometry.parent.y}`);
    }
  });
  it("rejects an unknown column instead of silently drawing a misleading line", () => {
    expect(() => columnAnchor(schemaLayout(768), "students", "enrollment_id", "right")).toThrow();
  });
  it("keeps every mobile table readable and fully visible when focused", () => {
    const width = 280, height = 340, layout = schemaLayout(width);
    for (const table of CAMPUS_TABLES) {
      const view = focusSchemaTable(layout, table, width, height);
      expect(view.scale).toBe(1);
      const left = layout.positions[table].x + view.x, top = layout.positions[table].y + view.y;
      expect(left).toBeGreaterThanOrEqual(0);
      expect(left + NODE_WIDTH).toBeLessThanOrEqual(width);
      expect(top).toBeGreaterThanOrEqual(0);
      expect(top + nodeHeight(table)).toBeLessThanOrEqual(height);
    }
  });
  it("fits all nodes on desktop without collisions", () => {
    const layout = schemaLayout(600), view = fitSchema(layout, 600, 520);
    expect(view.scale).toBeGreaterThan(0.9);
    for (const table of CAMPUS_TABLES) {
      const position = layout.positions[table];
      expect((position.x + NODE_WIDTH) * view.scale + view.x).toBeLessThanOrEqual(600);
      expect((position.y + nodeHeight(table)) * view.scale + view.y).toBeLessThanOrEqual(520);
    }
    expect(layout.positions.students.y + nodeHeight("students")).toBeLessThan(layout.positions.courses.y);
  });
  it("bounds pan and zoom so users can recover from an extreme gesture", () => {
    const view = clampSchemaView({ x: -100000, y: 100000, scale: 5 }, schemaLayout(600), 600, 520);
    expect(view.scale).toBe(1.5);
    expect(view.x).toBeGreaterThan(-1000);
    expect(view.y).toBe(472);
  });
});
