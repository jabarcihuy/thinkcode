import sqlite3InitModule, { type Database, type PreparedStatement, type Sqlite3Static } from "@sqlite.org/sqlite-wasm";
import { getDataset, isDatasetId, primaryKey } from "../data/datasets";
import type { DatasetId } from "../data/dataset-types";
import { seedPracticeDatabase } from "./sqlite-seed";
import {
  MAX_MUTATION_ROWS,
  MAX_RESULT_ROWS,
  inspectSqlStatement,
  type SqlMutation,
  type SqliteRow,
  type SqliteValue,
} from "@/features/database/domain/sql-query";

type WorkerRequest =
  | { action: "init"; datasetId: DatasetId }
  | { requestId: number; action: "run"; query: string }
  | { requestId: number; action: "confirm"; previewId: string }
  | { requestId: number; action: "cancel"; previewId: string };

type MutationAction = SqlMutation["action"];
type WorkerResponse =
  | { type: "ready" }
  | { type: "result"; requestId: number; rows: SqliteRow[]; columns: string[] }
  | { type: "mutation-preview"; requestId: number; previewId: string; action: MutationAction; table: string; affectedRows: number; beforeRows: SqliteRow[]; afterRows: SqliteRow[] }
  | { type: "mutation-result"; requestId: number; action: MutationAction; table: string; affectedRows: number; beforeRows: SqliteRow[]; afterRows: SqliteRow[]; tableRows: SqliteRow[] }
  | { type: "mutation-cancelled"; requestId: number }
  | { type: "query-error"; requestId: number; message: string }
  | { type: "startup-error" };

const scope = globalThis as unknown as {
  addEventListener(type: "message", listener: (event: MessageEvent<WorkerRequest>) => void): void;
  postMessage(message: WorkerResponse): void;
  location: Location;
};

const MAX_CELL_CHARS = 2_000;
const MAX_RESULT_CHARS = 80_000;
const MAX_TABLE_ROWS = 100;
const QUERY_TIME_LIMIT_MS = 1_400;
let ALLOWED_TABLES = new Set<string>();
let PRIMARY_KEYS: Record<string, string> = {};
const ALLOWED_FUNCTIONS = new Set(["count", "avg", "sum", "min", "max", "round"]);

type PendingMutation = {
  id: string;
  query: string;
  action: MutationAction;
  table: string;
  beforeRows: SqliteRow[];
  afterRows: SqliteRow[];
  affectedRows: number;
};

function createQueryError(requestId: number, message: string) {
  scope.postMessage({ type: "query-error", requestId, message });
}

function normalizeValue(value: unknown): SqliteValue {
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Uint8Array || value instanceof ArrayBuffer) throw new Error("Binary output is unsupported");
  return value as SqliteValue;
}

function assertOutputLimits(rows: SqliteRow[]) {
  if (rows.length > MAX_RESULT_ROWS) throw new Error("ROW_LIMIT");
  let outputChars = 0;
  for (const row of rows) {
    for (const value of Object.values(row)) {
      if (typeof value === "string" && value.length > MAX_CELL_CHARS) throw new Error("CELL_LIMIT");
      outputChars += String(value ?? "").length;
      if (outputChars > MAX_RESULT_CHARS) throw new Error("OUTPUT_LIMIT");
    }
  }
}

function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/foreign key/i.test(message)) return "Relasi foreign key tidak cocok. Pastikan record yang dirujuk sudah tersedia.";
  if (/unique|primary key/i.test(message)) return "Key tersebut sudah digunakan. Pilih key lain untuk record baru.";
  if (/not null/i.test(message)) return "Ada kolom wajib yang belum memiliki nilai.";
  if (/interrupt|time/i.test(message)) return "Query dihentikan karena terlalu lama. Sederhanakan query lalu coba lagi.";
  if (message === "ROW_LIMIT") return `Hasil dibatasi ${MAX_RESULT_ROWS} baris.`;
  if (message === "CELL_LIMIT") return "Salah satu nilai hasil terlalu panjang untuk ditampilkan.";
  if (message === "OUTPUT_LIMIT") return "Hasil terlalu besar untuk ditampilkan. Batasi jumlah baris atau kolom.";
  if (message === "MUTATION_LIMIT") return "Latihan hanya boleh mengubah satu record sekaligus. Periksa lagi target WHERE.";
  return "Query belum dapat dijalankan. Periksa nama tabel, kolom, nilai, dan sintaks SQL.";
}

function readRows(database: Database, sql: string): { rows: SqliteRow[]; columns: string[] } {
  let statement: PreparedStatement | null = null;
  try {
    statement = database.prepare(sql);
    const rawColumns = statement.getColumnNames() as string[];
    const columns = rawColumns.map((name, index) => rawColumns.indexOf(name) === index ? name : `${name} (${index + 1})`);
    const rows: SqliteRow[] = [];
    while (statement.step()) {
      const values = statement.get([]) as unknown[];
      const row: SqliteRow = {};
      for (const [index, rawValue] of values.entries()) {
        row[columns[index] ?? `kolom_${index + 1}`] = normalizeValue(rawValue);
      }
      rows.push(row);
      assertOutputLimits(rows);
    }
    return { rows, columns };
  } finally {
    statement?.finalize();
  }
}

function snapshotTable(database: Database, table: string): SqliteRow[] {
  if (!ALLOWED_TABLES.has(table)) throw new Error("Unsupported table");
  const key = PRIMARY_KEYS[table]!;
  const { rows } = readRows(database, `SELECT * FROM ${table} ORDER BY ${key}`);
  if (rows.length > MAX_TABLE_ROWS) throw new Error("ROW_LIMIT");
  return rows;
}

function changedRows(table: string, before: SqliteRow[], after: SqliteRow[]): { beforeRows: SqliteRow[]; afterRows: SqliteRow[] } {
  const key = PRIMARY_KEYS[table]!;
  const beforeByKey = new Map(before.map((row) => [String(row[key]), row]));
  const afterByKey = new Map(after.map((row) => [String(row[key]), row]));
  const oldRows: SqliteRow[] = [];
  const newRows: SqliteRow[] = [];
  for (const [id, row] of beforeByKey) {
    const updated = afterByKey.get(id);
    if (!updated || JSON.stringify(updated) !== JSON.stringify(row)) {
      oldRows.push(row);
      if (updated) newRows.push(updated);
    }
  }
  for (const [id, row] of afterByKey) if (!beforeByKey.has(id)) newRows.push(row);
  return { beforeRows: oldRows, afterRows: newRows };
}

function beginOperation(sqlite3: Sqlite3Static, handle: number, startedAt: number) {
  sqlite3.capi.sqlite3_progress_handler(handle, 1_000, () =>
    performance.now() - startedAt > QUERY_TIME_LIMIT_MS ? 1 : 0, 0);
}

async function startDatabase(datasetId: DatasetId) {
  const dataset = getDataset(datasetId);
  ALLOWED_TABLES = new Set(dataset.tables.map((table) => table.name));
  PRIMARY_KEYS = Object.fromEntries(dataset.tables.map((table) => [table.name, primaryKey(table)]));
  const initializeSqlite = sqlite3InitModule as unknown as (
    options: { locateFile: (fileName: string) => string },
  ) => Promise<Sqlite3Static>;
  const sqlite3 = await initializeSqlite({
    locateFile: (fileName) => fileName.endsWith(".wasm")
      ? new URL("/sqlite/sqlite3.wasm", scope.location.origin).href
      : fileName,
  });
  const database = new sqlite3.oo1.DB(":memory:");
  database.exec("PRAGMA foreign_keys = ON;");
  seedPracticeDatabase(database, dataset);

  const { capi } = sqlite3;
  const handle = database.pointer;
  if (handle === undefined) throw new Error("SQLite database did not open.");
  capi.sqlite3_limit(handle, capi.SQLITE_LIMIT_LENGTH, MAX_CELL_CHARS * 4);
  capi.sqlite3_limit(handle, capi.SQLITE_LIMIT_SQL_LENGTH, 4_096);
  capi.sqlite3_limit(handle, capi.SQLITE_LIMIT_COLUMN, 24);
  capi.sqlite3_limit(handle, capi.SQLITE_LIMIT_EXPR_DEPTH, 32);
  capi.sqlite3_limit(handle, capi.SQLITE_LIMIT_COMPOUND_SELECT, 8);
  capi.sqlite3_limit(handle, capi.SQLITE_LIMIT_FUNCTION_ARG, 8);
  capi.sqlite3_limit(handle, capi.SQLITE_LIMIT_ATTACHED, 0);
  capi.sqlite3_db_config(handle, capi.SQLITE_DBCONFIG_DEFENSIVE, 1);

  let authorizedMutation: { action: MutationAction; table: string } | null = null;
  capi.sqlite3_set_authorizer(handle, (_context: unknown, action: number, first: unknown, second: unknown) => {
    const table = String(first ?? "").toLowerCase();
    if (action === capi.SQLITE_SELECT) return capi.SQLITE_OK;
    if (action === capi.SQLITE_READ) return ALLOWED_TABLES.has(table) ? capi.SQLITE_OK : capi.SQLITE_DENY;
    if (action === capi.SQLITE_FUNCTION) {
      const name = String(second || first || "").toLowerCase();
      return ALLOWED_FUNCTIONS.has(name) ? capi.SQLITE_OK : capi.SQLITE_DENY;
    }
    if (action === capi.SQLITE_INSERT && ALLOWED_TABLES.has(table)) {
      authorizedMutation = { action: "INSERT", table };
      return capi.SQLITE_OK;
    }
    if (action === capi.SQLITE_UPDATE && ALLOWED_TABLES.has(table)) {
      const column = String(second ?? "").toLowerCase();
      if (column && column !== PRIMARY_KEYS[table]) {
        authorizedMutation = { action: "UPDATE", table };
        return capi.SQLITE_OK;
      }
      return capi.SQLITE_DENY;
    }
    if (action === capi.SQLITE_DELETE && ALLOWED_TABLES.has(table)) {
      authorizedMutation = { action: "DELETE", table };
      return capi.SQLITE_OK;
    }
    if (action === capi.SQLITE_SAVEPOINT) {
      const savepoint = String(second ?? "").toLowerCase();
      return savepoint.startsWith("quethink_") ? capi.SQLITE_OK : capi.SQLITE_DENY;
    }
    return capi.SQLITE_DENY;
  }, 0);

  return { database, sqlite3, handle, getAuthorizedMutation: () => authorizedMutation, clearAuthorizedMutation: () => { authorizedMutation = null; } };
}

function initialize(datasetId: DatasetId) {
void startDatabase(datasetId).then(({ database, sqlite3, handle, getAuthorizedMutation, clearAuthorizedMutation }) => {
  let pendingMutation: PendingMutation | null = null;
  let previewSequence = 0;
  scope.postMessage({ type: "ready" });

  scope.addEventListener("message", (event) => {
    const request = event.data;
    if (request.action === "init") return;
    const { requestId } = request;
    const startedAt = performance.now();
    beginOperation(sqlite3, handle, startedAt);
    try {
      if (request.action === "cancel") {
        if (pendingMutation?.id === request.previewId) pendingMutation = null;
        scope.postMessage({ type: "mutation-cancelled", requestId });
        return;
      }
      if (request.action === "confirm") {
        if (!pendingMutation || pendingMutation.id !== request.previewId) {
          throw new Error("Preview tidak ditemukan. Jalankan kembali query perubahan.");
        }
        const staged = pendingMutation;
        database.exec("SAVEPOINT quethink_confirm");
        try {
          clearAuthorizedMutation();
          const statement = database.prepare(staged.query);
          try {
            const pointer = statement.pointer;
            if (pointer === undefined || sqlite3.capi.sqlite3_stmt_readonly(pointer)) throw new Error("Expected data mutation");
            statement.step();
          } finally {
            statement.finalize();
          }
          const authorized = getAuthorizedMutation();
          const affectedRows = sqlite3.capi.sqlite3_changes(handle);
          if (!authorized || authorized.action !== staged.action || authorized.table !== staged.table || affectedRows !== staged.affectedRows || affectedRows > MAX_MUTATION_ROWS) {
            throw new Error("MUTATION_LIMIT");
          }
          const tableRows = snapshotTable(database, staged.table);
          assertOutputLimits(tableRows);
          database.exec("RELEASE quethink_confirm");
          pendingMutation = null;
          const afterRows = changedRows(staged.table, staged.beforeRows, tableRows).afterRows;
          scope.postMessage({ type: "mutation-result", requestId, action: staged.action, table: staged.table, affectedRows, beforeRows: staged.beforeRows, afterRows, tableRows });
        } catch (error) {
          try { database.exec("ROLLBACK TO quethink_confirm; RELEASE quethink_confirm"); } catch { /* Worker is reset by the caller on timeout. */ }
          pendingMutation = null;
          throw error;
        }
        return;
      }

      if (pendingMutation) throw new Error("Tinjau, terapkan, atau batalkan perubahan yang masih menunggu.");
      const parsed = inspectSqlStatement(request.query, getDataset(datasetId));
      if (parsed.kind === "select") {
        clearAuthorizedMutation();
        const statement = database.prepare(request.query);
        try {
          const pointer = statement.pointer;
          if (pointer === undefined || !sqlite3.capi.sqlite3_stmt_readonly(pointer)) throw new Error("Expected read-only statement");
          const rawColumns = statement.getColumnNames() as string[];
          const columns = rawColumns.map((name, index) => rawColumns.indexOf(name) === index ? name : `${name} (${index + 1})`);
          const rows: SqliteRow[] = [];
          while (statement.step()) {
            const values = statement.get([]) as unknown[];
            const row: SqliteRow = {};
            for (const [index, value] of values.entries()) row[columns[index] ?? `kolom_${index + 1}`] = normalizeValue(value);
            rows.push(row);
            assertOutputLimits(rows);
          }
          scope.postMessage({ type: "result", requestId, rows, columns });
        } finally {
          statement.finalize();
        }
        return;
      }

      const beforeTable = snapshotTable(database, parsed.table);
      database.exec("SAVEPOINT quethink_preview");
      try {
        clearAuthorizedMutation();
        const statement = database.prepare(request.query);
        try {
          const pointer = statement.pointer;
          if (pointer === undefined || sqlite3.capi.sqlite3_stmt_readonly(pointer)) throw new Error("Expected data mutation");
          statement.step();
        } finally {
          statement.finalize();
        }
        const authorized = getAuthorizedMutation();
        const affectedRows = sqlite3.capi.sqlite3_changes(handle);
        if (!authorized || authorized.action !== parsed.action || authorized.table !== parsed.table || affectedRows > MAX_MUTATION_ROWS) {
          throw new Error("MUTATION_LIMIT");
        }
        const afterTable = snapshotTable(database, parsed.table);
        assertOutputLimits(afterTable);
        const diff = changedRows(parsed.table, beforeTable, afterTable);
        database.exec("ROLLBACK TO quethink_preview; RELEASE quethink_preview");
        if (affectedRows === 0) {
          scope.postMessage({ type: "mutation-result", requestId, action: parsed.action, table: parsed.table, affectedRows, beforeRows: [], afterRows: [], tableRows: beforeTable });
          return;
        }
        const id = `preview-${++previewSequence}`;
        pendingMutation = {
          id,
          query: request.query,
          action: parsed.action,
          table: parsed.table,
          beforeRows: diff.beforeRows,
          afterRows: diff.afterRows,
          affectedRows,
        };
        scope.postMessage({ type: "mutation-preview", requestId, previewId: id, action: parsed.action, table: parsed.table, affectedRows, beforeRows: diff.beforeRows, afterRows: diff.afterRows });
      } catch (error) {
        try { database.exec("ROLLBACK TO quethink_preview; RELEASE quethink_preview"); } catch { /* A failed prepare may not have opened a savepoint. */ }
        throw error;
      }
    } catch (error) {
      createQueryError(requestId, safeErrorMessage(error));
    } finally {
      sqlite3.capi.sqlite3_progress_handler(handle, 0, 0, 0);
    }
  });
}).catch(() => scope.postMessage({ type: "startup-error" }));

}
let initialized = false;
scope.addEventListener("message", (event) => {
  if (event.data.action !== "init" || initialized) return;
  initialized = true;
  if (!isDatasetId(event.data.datasetId)) { scope.postMessage({ type: "startup-error" }); return; }
  initialize(event.data.datasetId);
});
