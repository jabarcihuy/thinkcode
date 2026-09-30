import type { SqliteRow } from "../domain/sql-query";

export type DatasetId = "campus" | "library" | "shop";
export type DatasetColumn = { name: string; type: "integer" | "real" | "text"; key?: "PK" | "FK" };
export type DatasetTable = { name: string; labelColumn: string; columns: readonly DatasetColumn[]; rows: readonly SqliteRow[] };
export type SchemaRelation = { id: string; parent: string; parentColumn: string; child: string; childColumn: string; explanation: string };
export type PracticeDataset = { id: DatasetId; title: string; description: string; tables: readonly DatasetTable[]; relations: readonly SchemaRelation[]; starterSql: string };
export type DatasetSnapshot = Record<string, SqliteRow[]>;
export type RecordSelection = { table: string; id: number };
