import sqlite3InitModule, { type Sqlite3Static } from "@sqlite.org/sqlite-wasm";
import {
  sqlabDocumentSchema,
  schemaSql,
  quoteIdentifier,
  type SqlabDocument,
} from "../domain/document";
import { querySchema } from "../domain/query";

const scope = globalThis as unknown as {
  location: Location;
  onmessage: (e: MessageEvent) => void;
  postMessage: (value: unknown) => void;
};
scope.onmessage = (event) => {
  void execute(event.data).catch(() =>
    scope.postMessage({ error: "Database belum dapat dimuat. Coba lagi." }),
  );
};
async function execute(raw: { document: SqlabDocument; query: string }) {
  const doc = sqlabDocumentSchema.parse(raw.document);
  const query = querySchema.parse(raw.query);
  const init = sqlite3InitModule as unknown as (o: {
    locateFile: (name: string) => string;
  }) => Promise<Sqlite3Static>;
  const sqlite = await init({
    locateFile: (n) =>
      n.endsWith(".wasm")
        ? new URL("/sqlite/sqlite3.wasm", scope.location.origin).href
        : n,
  });
  scope.postMessage({ ready: true });
  const db = new sqlite.oo1.DB(":memory:");
  try {
    db.exec(
      "PRAGMA max_page_count = 512; PRAGMA foreign_keys = ON; BEGIN; PRAGMA defer_foreign_keys = ON;",
    );
    db.exec(schemaSql(doc));
    for (const table of doc.schema.tables) {
      if (!table.columns.length) continue;
      const stmt = db.prepare(
        `INSERT INTO ${quoteIdentifier(table.name)} (${table.columns.map((c) => quoteIdentifier(c.name)).join(",")}) VALUES (${table.columns.map(() => "?").join(",")})`,
      );
      try {
        for (const row of doc.rows[table.id] ?? [])
          stmt.bind(table.columns.map((c) => row[c.name] ?? null)).stepReset();
      } finally {
        stmt.finalize();
      }
    }
    db.exec("COMMIT");
    const { capi } = sqlite;
    const handle = db.pointer!;
    capi.sqlite3_limit(handle, capi.SQLITE_LIMIT_LENGTH, 4096);
    capi.sqlite3_limit(handle, capi.SQLITE_LIMIT_SQL_LENGTH, 4096);
    capi.sqlite3_limit(handle, capi.SQLITE_LIMIT_COLUMN, 24);
    capi.sqlite3_limit(handle, capi.SQLITE_LIMIT_EXPR_DEPTH, 32);
    capi.sqlite3_limit(handle, capi.SQLITE_LIMIT_ATTACHED, 0);
    capi.sqlite3_db_config(handle, capi.SQLITE_DBCONFIG_DEFENSIVE, 1);
    const names = new Set(
      doc.schema.tables.filter((t) => t.columns.length).map((t) => t.name),
    );
    const functions = new Set([
      "count",
      "sum",
      "avg",
      "min",
      "max",
      "round",
      "length",
      "lower",
      "upper",
      "coalesce",
      "abs",
      "substr",
      "trim",
    ]);
    capi.sqlite3_set_authorizer(
      handle,
      (_: unknown, action: number, first: unknown, second: unknown) => {
        if (action === capi.SQLITE_SELECT) return capi.SQLITE_OK;
        if (
          action === capi.SQLITE_READ ||
          action === capi.SQLITE_INSERT ||
          action === capi.SQLITE_UPDATE ||
          action === capi.SQLITE_DELETE
        )
          return names.has(String(first)) ? capi.SQLITE_OK : capi.SQLITE_DENY;
        if (action === capi.SQLITE_FUNCTION)
          return functions.has(String(second || first).toLowerCase())
            ? capi.SQLITE_OK
            : capi.SQLITE_DENY;
        return capi.SQLITE_DENY;
      },
      0,
    );
    const started = performance.now();
    capi.sqlite3_progress_handler(
      handle,
      1000,
      () => (performance.now() - started > 1400 ? 1 : 0),
      0,
    );
    const rows: Record<string, string | number | null>[] = [];
    const stmt = db.prepare(query);
    let columns: string[];
    try {
      const rawNames = stmt.columnCount ? stmt.getColumnNames() : [];
      columns = rawNames.map((name, i) =>
        rawNames.indexOf(name) === i ? name : `${name} (${i + 1})`,
      );
      while (stmt.step()) {
        const values = stmt.get([]) as (string | number | bigint | null)[];
        rows.push(
          Object.fromEntries(
            values.map((v, i) => [
              columns[i]!,
              typeof v === "bigint" ? String(v) : v,
            ]),
          ),
        );
        if (
          rows.length > 100 ||
          new TextEncoder().encode(JSON.stringify(rows)).length > 80_000
        )
          throw new Error("OUTPUT_LIMIT");
      }
    } finally {
      stmt.finalize();
    }
    const next = {
      ...doc,
      rows: Object.fromEntries(
        doc.schema.tables.map((t) => [
          t.id,
          t.columns.length
            ? db.selectObjects(
                `SELECT * FROM ${quoteIdentifier(t.name)} LIMIT 101`,
              )
            : [],
        ]),
      ),
    };
    const validated = sqlabDocumentSchema.parse(next);
    scope.postMessage({
      columns,
      rows,
      document: validated,
      changes: db.changes(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    scope.postMessage({
      error: /interrupt/i.test(message)
        ? "Query terlalu lama dan sudah dihentikan."
        : /foreign key/i.test(message)
          ? "Foreign key tidak cocok dengan data rujukan."
          : /unique|not null/i.test(message)
            ? "Periksa primary key: harus unik dan terisi."
            : /OUTPUT_LIMIT/.test(message)
              ? "Hasil terlalu besar. Batasi dengan LIMIT."
              : "Query ditolak. Periksa sintaks, tipe data, nama tabel, dan batas 100 record per tabel.",
    });
  } finally {
    db.close();
  }
}
