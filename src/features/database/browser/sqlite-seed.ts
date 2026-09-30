import type { Database } from "@sqlite.org/sqlite-wasm";
import type { PracticeDataset } from "../data/dataset-types";

/** Only called with the immutable shipped registry, before the authorizer is enabled. */
export function datasetSchemaSql(dataset: PracticeDataset): string {
  return dataset.tables.map((table) => `CREATE TABLE ${table.name} (${table.columns.map((column) => {
    const relation = dataset.relations.find((item) => item.child === table.name && item.childColumn === column.name);
    const unique = table.name === "courses" && column.name === "course_code" ? " UNIQUE" : "";
    return `${column.name} ${column.type.toUpperCase()}${column.key === "PK" ? " PRIMARY KEY" : ` NOT NULL${unique}`}${relation ? ` REFERENCES ${relation.parent}(${relation.parentColumn})` : ""}`;
  }).join(", ")});`).join("\n");
}
export function datasetSeedOrder(dataset: PracticeDataset) {
  const remaining = [...dataset.tables];
  const ordered: typeof remaining = [];
  while (remaining.length) {
    const index = remaining.findIndex((table) => dataset.relations.filter((item) => item.child === table.name).every((item) => ordered.some((parent) => parent.name === item.parent)));
    if (index < 0) throw new Error("Practice dataset has cyclic dependencies");
    ordered.push(remaining.splice(index, 1)[0]!);
  }
  return ordered;
}
export function seedPracticeDatabase(database: Database, dataset: PracticeDataset) {
  database.exec(datasetSchemaSql(dataset));
  for (const table of datasetSeedOrder(dataset)) {
    const columns = table.columns.map((column) => column.name);
    const statement = database.prepare(`INSERT INTO ${table.name} (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`);
    try { for (const row of table.rows) statement.bind(columns.map((column) => row[column]!)).stepReset(); }
    finally { statement.finalize(); }
  }
}
