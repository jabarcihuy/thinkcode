// Trusted host code only. Learner SQL is data for SQLite, never JavaScript source.
import { parentPort, workerData } from "node:worker_threads";
import initializeSQLite from "@sqlite.org/sqlite-wasm";

const { query, config, key, schema, tables } = workerData;
const allowedTables = new Set(tables.map((table) => table.name));
const allowedFunctions = new Set(["count", "avg", "sum", "min", "max", "round"]);
const sqlite = await initializeSQLite({ print: () => {}, printErr: () => {} });
const { capi } = sqlite;
function readRows(db, source) {
  const statement = db.prepare(source);
  try {
    if (statement.columnCount > 24) throw new Error("OUTPUT_LIMIT");
    const rows = []; let characters = 0;
    while (statement.step()) {
      const row = statement.get([]);
      if (rows.length >= 100) throw new Error("OUTPUT_LIMIT");
      for (const cell of row) {
        if (!(cell === null || typeof cell === "string" || typeof cell === "number" && Number.isFinite(cell))) throw new Error("UNSUPPORTED_CELL");
        const size = String(cell ?? "").length;
        characters += size;
        if (size > 2000 || characters > 80000) throw new Error("OUTPUT_LIMIT");
      }
      rows.push(row);
    }
    return { columns: statement.columnCount, rows };
  } finally { statement.finalize(); }
}
function execute(source, fixture) {
  const db = new sqlite.oo1.DB(":memory:");
  try {
    db.exec("PRAGMA foreign_keys=ON;"); db.exec(schema);
    for (const table of tables) {
      const columns = table.columns.map((column) => column.name);
      const insert = db.prepare(`INSERT INTO ${table.name} (${columns.join(",")}) VALUES (${columns.map(() => "?").join(",")})`);
      try { for (const row of fixture.rows[table.name] ?? table.rows) insert.bind(columns.map((column) => row[column])).stepReset(); }
      finally { insert.finalize(); }
    }
    const handle = db.pointer;
    for (const [limit, value] of [[capi.SQLITE_LIMIT_LENGTH,8000],[capi.SQLITE_LIMIT_SQL_LENGTH,4096],[capi.SQLITE_LIMIT_COLUMN,24],[capi.SQLITE_LIMIT_EXPR_DEPTH,32],[capi.SQLITE_LIMIT_COMPOUND_SELECT,4],[capi.SQLITE_LIMIT_FUNCTION_ARG,8],[capi.SQLITE_LIMIT_ATTACHED,0],[capi.SQLITE_LIMIT_VDBE_OP,10000]]) capi.sqlite3_limit(handle,limit,value);
    capi.sqlite3_db_config(handle,capi.SQLITE_DBCONFIG_DEFENSIVE,1);
    let snapshots = false;
    capi.sqlite3_set_authorizer(handle, (_context, action, first, second) => {
      const table = String(first ?? "").toLowerCase();
      if (action === capi.SQLITE_SELECT) return capi.SQLITE_OK;
      if (action === capi.SQLITE_READ) return allowedTables.has(table) ? capi.SQLITE_OK : capi.SQLITE_DENY;
      if (action === capi.SQLITE_FUNCTION) return allowedFunctions.has(String(second || first || "").toLowerCase()) ? capi.SQLITE_OK : capi.SQLITE_DENY;
      if (!snapshots && table === config.table) {
        if (action === capi[`SQLITE_${config.operation}`]) {
          const primaryKey = tables.find((item) => item.name === table).columns.find((column) => column.key === "PK").name;
          return action !== capi.SQLITE_UPDATE || second !== primaryKey ? capi.SQLITE_OK : capi.SQLITE_DENY;
        }
      }
      return capi.SQLITE_DENY;
    }, 0);
    let operations = 0; const deadline = performance.now()+250;
    capi.sqlite3_progress_handler(handle,1000,()=> {
      operations += 1000;
      return operations > 250000 || performance.now() > deadline || sqlite.wasm.heap8u().length > 32*1024*1024 ? 1 : 0;
    },0);
    if (config.operation === "SELECT") return readRows(db,source);
    const statement = db.prepare(source);
    try { statement.step(); } finally { statement.finalize(); }
    const changed = capi.sqlite3_changes(handle);
    if (changed !== 1) throw new Error("MUTATION_LIMIT");
    snapshots = true;
    return { changed, snapshots: tables.map((table)=> readRows(db,`SELECT * FROM ${table.name} ORDER BY ${table.columns.find((column)=>column.key === "PK").name}`)) };
  } finally { db.close(); }
}
function normalize(result) {
  if (!key.ordered && result.rows) result.rows.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return result;
}
try {
  const passed = key.fixtures.map((fixture)=> {
    // A broken reference/seed is a configuration failure, never a student zero.
    const expected = normalize(execute(key.referenceQuery,fixture));
    try { return JSON.stringify(normalize(execute(query,fixture))) === JSON.stringify(expected); }
    catch { return false; }
  });
  parentPort.postMessage({ type: "result", passed });
} catch { parentPort.postMessage({ type: "configuration-error" }); }
