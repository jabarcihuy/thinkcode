import { CAMPUS_COURSES, CAMPUS_ENROLLMENTS, CAMPUS_STUDENTS, STARTER_SQL } from "./campus-mini";
import { LIBRARY_DATASET } from "./library";
import { SHOP_DATASET } from "./shop";
import type { DatasetId, DatasetTable, PracticeDataset } from "./dataset-types";

export const CAMPUS_DATASET: PracticeDataset = {
  id: "campus", title: "Kampus Mini", description: "Pendaftaran menghubungkan mahasiswa dan mata kuliah.", starterSql: STARTER_SQL,
  tables: [
    { name: "students", labelColumn: "name", columns: [{ name: "student_id", type: "integer", key: "PK" }, { name: "name", type: "text" }, { name: "cohort", type: "text" }], rows: CAMPUS_STUDENTS },
    { name: "enrollments", labelColumn: "score", columns: [{ name: "enrollment_id", type: "integer", key: "PK" }, { name: "student_id", type: "integer", key: "FK" }, { name: "course_id", type: "integer", key: "FK" }, { name: "score", type: "real" }], rows: CAMPUS_ENROLLMENTS },
    { name: "courses", labelColumn: "course_name", columns: [{ name: "course_id", type: "integer", key: "PK" }, { name: "course_code", type: "text" }, { name: "course_name", type: "text" }, { name: "credits", type: "integer" }], rows: CAMPUS_COURSES },
  ],
  relations: [
    { id: "student-enrollments", parent: "students", parentColumn: "student_id", child: "enrollments", childColumn: "student_id", explanation: "Satu mahasiswa dapat memiliki banyak pendaftaran." },
    { id: "course-enrollments", parent: "courses", parentColumn: "course_id", child: "enrollments", childColumn: "course_id", explanation: "Satu mata kuliah dapat memiliki banyak pendaftaran." },
  ],
};

export const PRACTICE_DATASETS: readonly PracticeDataset[] = [CAMPUS_DATASET, LIBRARY_DATASET, SHOP_DATASET];
export function isDatasetId(value: unknown): value is DatasetId { return PRACTICE_DATASETS.some((dataset) => dataset.id === value); }
export function getDataset(id: DatasetId): PracticeDataset {
  const dataset = PRACTICE_DATASETS.find((item) => item.id === id);
  if (!dataset) throw new Error("Unknown practice dataset");
  return dataset;
}
export function getDatasetTable(dataset: PracticeDataset, name: string): DatasetTable {
  const table = dataset.tables.find((item) => item.name === name);
  if (!table) throw new Error("Unknown practice table");
  return table;
}
export function primaryKey(table: DatasetTable): string { return table.columns.find((column) => column.key === "PK")!.name; }
export function exerciseDatasetId(config: unknown): DatasetId {
  if (config && typeof config === "object" && "datasetId" in config && isDatasetId(config.datasetId)) return config.datasetId;
  return "campus";
}
