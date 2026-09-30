import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getDataset, getDatasetTable, isDatasetId, PRACTICE_DATASETS, primaryKey, exerciseDatasetId } from "../data/datasets";
import type { PracticeDataset } from "../data/dataset-types";
import { datasetSchemaSql, datasetSeedOrder } from "../browser/sqlite-seed";
import { initialDatasetSnapshot, relatedRecords, applyDatasetMutation } from "./dataset-exploration";
import { columnAnchor, focusSchemaTable, nodeHeight, NODE_WIDTH, relationGeometry, schemaLayout, querySourceTables } from "./schema-visualizer";
import { inspectSqlStatement } from "./sql-query";
import { lessonScenarios } from "./lesson-scenarios";
import { gradeExercise } from "@/features/practice/domain/grade-exercise";
import type { GradingExercise } from "@/features/practice/types";
import type { SubmissionInput } from "@/features/practice/validation/submission";

type TransferExercise = { slug: string; type: GradingExercise["type"]; starter_code: string | null; config: GradingExercise["config"] & { public: { datasetId: "library" | "shop" }; answer: NonNullable<SubmissionInput["answer"]> } };
const migration = readFileSync("supabase/migrations/20260930141504_varied_practice_datasets.sql", "utf8");
const exercises = JSON.parse(migration.match(/\$datasets\$([\s\S]*?)\$datasets\$/)![1]) as TransferExercise[];
function withDatabase<T>(dataset: PracticeDataset, action: (db: DatabaseSync) => T): T {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec("PRAGMA foreign_keys = ON;");
    db.exec(datasetSchemaSql(dataset));
    for (const table of datasetSeedOrder(dataset)) {
      const columns = table.columns.map((column) => column.name);
      const insert = db.prepare(`INSERT INTO ${table.name} (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`);
      for (const row of table.rows) insert.run(...columns.map((column) => row[column]!));
    }
    return action(db);
  } finally { db.close(); }
}

describe("varied practice datasets", () => {
  it("has three genuinely different schema sizes and no arbitrary IDs", () => {
    expect(PRACTICE_DATASETS.map((dataset) => dataset.tables.length)).toEqual([3, 2, 4]);
    expect(isDatasetId("production")).toBe(false);
    expect(exerciseDatasetId({ datasetId: "library" })).toBe("library");
    expect(exerciseDatasetId(null)).toBe("campus");
  });
  it.each(PRACTICE_DATASETS)("runs the starter on actual SQLite: $id", (dataset) => {
    withDatabase(dataset, (db) => {
      expect(db.prepare(dataset.starterSql).all().length).toBeGreaterThan(0);
      expect(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name).sort()).toEqual(dataset.tables.map((table) => table.name).sort());
      for (const other of PRACTICE_DATASETS.filter((item) => item.id !== dataset.id)) expect(() => db.prepare(`SELECT * FROM ${other.tables[0]!.name}`)).toThrow();
    });
  });
  it.each(PRACTICE_DATASETS)("supports one-row writes and real FK constraints: $id", (dataset) => {
    withDatabase(dataset, (db) => {
      const child = dataset.relations[0]!;
      const table = getDatasetTable(dataset, child.child);
      const key = primaryKey(table);
      const attribute = table.columns.find((column) => !column.key && column.type !== "text") ?? table.columns.find((column) => !column.key)!;
      const value = attribute.type === "text" ? "Changed" : 7;
      const id = table.rows[0]![key]!;
      expect(db.prepare(`UPDATE ${table.name} SET ${attribute.name} = ? WHERE ${key} = ?`).run(value, id).changes).toBe(1);
      expect(db.prepare(`SELECT ${attribute.name} FROM ${table.name} WHERE ${key} = ?`).get(id)?.[attribute.name]).toBe(value);
      expect(() => db.prepare(`UPDATE ${table.name} SET ${child.childColumn} = 999 WHERE ${key} = ?`).run(id)).toThrow(/foreign key/i);
      const parentId = getDatasetTable(dataset, child.parent).rows[0]![child.parentColumn]!;
      expect(() => db.prepare(`DELETE FROM ${child.parent} WHERE ${child.parentColumn} = ?`).run(parentId)).toThrow(/foreign key/i);
    });
  });
  it("validates writes against the active schema, with the correct primary key", () => {
    expect(inspectSqlStatement("UPDATE books SET stock = 4 WHERE book_id = 20;", getDataset("library"))).toEqual({ kind: "mutation", action: "UPDATE", table: "books" });
    expect(() => inspectSqlStatement("DELETE FROM books WHERE book_id = 20;", getDataset("campus"))).toThrow();
    expect(() => inspectSqlStatement("UPDATE order_items SET quantity = 4 WHERE product_id = 20;", getDataset("shop"))).toThrow();
    expect(() => inspectSqlStatement("UPDATE products SET product_id = 11 WHERE product_id = 10;", getDataset("shop"))).toThrow();
  });
  it("follows the complete shop chain without spreading into unrelated orders", () => {
    const dataset = getDataset("shop"), snapshot = initialDatasetSnapshot(dataset);
    expect([...relatedRecords(dataset, snapshot, { table: "customers", id: 1 })].sort()).toEqual(["customers:1", "order_items:1", "order_items:2", "order_items:4", "orders:100", "orders:300", "products:10", "products:20"]);
    const next = applyDatasetMutation(dataset, snapshot, "order_items", snapshot.order_items!.filter((row) => row.item_id !== 2));
    expect(relatedRecords(dataset, next, { table: "orders", id: 100 }).has("products:20")).toBe(false);
    expect(snapshot.order_items).toHaveLength(4);
  });
  it.each(PRACTICE_DATASETS)("keeps nodes readable on mobile and routes named key columns: $id", (dataset) => {
    for (const width of [280, 360, 768, 1280]) {
      const layout = schemaLayout(width, dataset);
      for (const table of dataset.tables) {
        const view = focusSchemaTable(layout, table.name, width, 340);
        expect(layout.positions[table.name]!.x + view.x).toBeGreaterThanOrEqual(0);
        expect(layout.positions[table.name]!.x + view.x + NODE_WIDTH).toBeLessThanOrEqual(width);
        expect(layout.positions[table.name]!.y + view.y).toBeGreaterThanOrEqual(0);
        expect(layout.positions[table.name]!.y + view.y + nodeHeight(table.name, dataset)).toBeLessThanOrEqual(340);
      }
      for (const relation of dataset.relations) expect(relationGeometry(layout, relation).parent).toEqual(columnAnchor(layout, relation.parent, relation.parentColumn, "right"));
    }
    expect(querySourceTables(dataset.starterSql, dataset).length).toBeGreaterThan(0);
  });
  it("adds optional transfer to each lesson without replacing the mandatory seed", () => {
    expect(exercises).toHaveLength(11);
    expect(new Set(exercises.map((exercise) => exercise.slug)).size).toBe(11);
    expect(migration).toContain("Position 4 must not replace mandatory practice");
    expect(migration).toContain("is_required=false");
    for (const exercise of exercises) expect(Object.keys(exercise.config.public)).not.toContain("answer");
  });
  it.each(exercises)("grades the transfer exercise and matches SQLite output: $slug", (exercise) => {
    const dataset = getDataset(exercise.config.public.datasetId);
    const gradingExercise: GradingExercise = { id: exercise.slug, lessonId: exercise.slug, type: exercise.type, config: exercise.config, tests: [] };
    const submission: SubmissionInput = { pathSlug: "database-fundamentals", sourceCode: null, runResults: null, answer: exercise.config.answer };
    expect(gradeExercise(gradingExercise, submission).passed).toBe(true);
    const wrong = "output" in exercise.config.answer ? { output: "WRONG" } : { choiceId: "WRONG" };
    expect(gradeExercise(gradingExercise, { ...submission, answer: wrong }).passed).toBe(false);
    if (exercise.starter_code && "output" in exercise.config.answer) {
      withDatabase(dataset, (db) => {
        const rows = db.prepare(exercise.starter_code!).all();
        expect(rows.map((row) => Object.values(row).join(" | ")).join("\n")).toBe(exercise.config.answer && "output" in exercise.config.answer ? exercise.config.answer.output : "");
      });
    }
    const scenarios = lessonScenarios(exercise.slug, { title: "Campus", sql: "SELECT name FROM students;", prompt: "" });
    for (const scenario of scenarios) withDatabase(getDataset(scenario.datasetId), (db) => {
      const statement = inspectSqlStatement(scenario.sql, getDataset(scenario.datasetId));
      if (statement.kind === "select") expect(db.prepare(scenario.sql).all().length).toBeGreaterThan(0);
      else expect(db.prepare(scenario.sql).run().changes).toBe(1);
    });
  });
});
