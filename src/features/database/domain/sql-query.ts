import { CAMPUS_DATASET, primaryKey } from "../data/datasets";
import type { PracticeDataset } from "../data/dataset-types";

export const MAX_QUERY_LENGTH = 4_096;
export const MAX_RESULT_ROWS = 100;
export const MAX_MUTATION_ROWS = 1;

export type SqliteValue = string | number | null;
export type SqliteRow = Record<string, SqliteValue>;

export type SqlMutation = {
  kind: "mutation";
  action: "INSERT" | "UPDATE" | "DELETE";
  table: string;
};

export type SqlStatement = { kind: "select" } | SqlMutation;

export class SqlQueryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SqlQueryValidationError";
  }
}

type Token = { kind: "word" | "number" | "string" | "quoted-identifier" | "symbol"; value: string };

function stripFinalSemicolon(source: string): string {
  let quote: "'" | '"' | "`" | "]" | null = null;
  let finalSemicolon = -1;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if ((quote === "]" && character === "]") || character === quote) {
        if (source[index + 1] === quote && quote !== "]") index += 1;
        else quote = null;
      }
      continue;
    }
    if (character === "'" || character === '"' || character === "`") quote = character;
    else if (character === "[") quote = "]";
    else if (character === "-" && source[index + 1] === "-") {
      throw new SqlQueryValidationError("Komentar SQL belum didukung di lab ini.");
    } else if (character === "/" && source[index + 1] === "*") {
      throw new SqlQueryValidationError("Komentar SQL belum didukung di lab ini.");
    } else if (character === ";") {
      if (source.slice(index + 1).trim()) {
        throw new SqlQueryValidationError("Jalankan satu query saja. Hapus perintah setelah titik koma.");
      }
      finalSemicolon = index;
    }
  }
  if (quote) throw new SqlQueryValidationError("Tanda petik SQL belum berpasangan.");
  return finalSemicolon < 0 ? source.trim() : source.slice(0, finalSemicolon).trim();
}

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  for (let index = 0; index < source.length;) {
    const character = source[index]!;
    if (/\s/.test(character)) { index += 1; continue; }
    if (character === "'") {
      let value = "";
      index += 1;
      let closed = false;
      while (index < source.length) {
        if (source[index] === "'" && source[index + 1] === "'") { value += "'"; index += 2; continue; }
        if (source[index] === "'") { index += 1; closed = true; break; }
        value += source[index++]!;
      }
      if (!closed) throw new SqlQueryValidationError("Tanda petik SQL belum berpasangan.");
      tokens.push({ kind: "string", value });
      continue;
    }
    if (character === '"' || character === "`" || character === "[") {
      const close = character === "[" ? "]" : character;
      let value = "";
      index += 1;
      while (index < source.length && source[index] !== close) value += source[index++]!;
      if (source[index] !== close) throw new SqlQueryValidationError("Nama kolom SQL belum lengkap.");
      index += 1;
      tokens.push({ kind: "quoted-identifier", value: value.toLowerCase() });
      continue;
    }
    const word = /^[A-Za-z_][A-Za-z0-9_]*/.exec(source.slice(index))?.[0];
    if (word) { tokens.push({ kind: "word", value: word.toLowerCase() }); index += word.length; continue; }
    const number = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(source.slice(index))?.[0];
    if (number) { tokens.push({ kind: "number", value: number }); index += number.length; continue; }
    tokens.push({ kind: "symbol", value: character });
    index += 1;
  }
  return tokens;
}

function word(token: Token | undefined, expected?: string): string | null {
  return token?.kind === "word" && (expected === undefined || token.value === expected) ? token.value : null;
}

function supportedTable(token: Token | undefined, dataset: PracticeDataset) {
  const value = word(token);
  return dataset.tables.find((table) => table.name === value) ?? null;
}

function parseLiteral(tokens: Token[], index: number): number {
  const token = tokens[index];
  if (token?.kind === "string" || token?.kind === "number" || word(token, "null")) return index + 1;
  if ((token?.value === "-" || token?.value === "+") && tokens[index + 1]?.kind === "number") return index + 2;
  throw new SqlQueryValidationError("Gunakan nilai teks, angka, atau NULL pada perintah perubahan data.");
}

function expectSymbol(tokens: Token[], index: number, expected: string): number {
  if (tokens[index]?.value !== expected) throw new SqlQueryValidationError(`Periksa kembali perintah SQL di sekitar ${expected}.`);
  return index + 1;
}

function expectWord(tokens: Token[], index: number, expected: string): number {
  if (!word(tokens[index], expected)) throw new SqlQueryValidationError(`Perintah perubahan perlu menggunakan ${expected.toUpperCase()}.`);
  return index + 1;
}

function parseInsert(tokens: Token[], dataset: PracticeDataset): SqlMutation {
  let index = expectWord(tokens, 0, "insert");
  index = expectWord(tokens, index, "into");
  const table = supportedTable(tokens[index], dataset);
  if (!table) throw new SqlQueryValidationError(`Pilih tabel pada skema ${dataset.title}: ${dataset.tables.map((item) => item.name).join(", ")}.`);
  index += 1;
  index = expectSymbol(tokens, index, "(");
  const columns: string[] = [];
  while (true) {
    const column = word(tokens[index]);
    if (!column || !table.columns.some((item) => item.name === column)) throw new SqlQueryValidationError("Periksa nama kolom pada daftar INSERT.");
    if (columns.includes(column)) throw new SqlQueryValidationError("Kolom INSERT tidak boleh ditulis dua kali.");
    columns.push(column);
    index += 1;
    if (tokens[index]?.value !== ",") break;
    index += 1;
  }
  index = expectSymbol(tokens, index, ")");
  index = expectWord(tokens, index, "values");
  index = expectSymbol(tokens, index, "(");
  let valueCount = 0;
  while (true) {
    index = parseLiteral(tokens, index);
    valueCount += 1;
    if (tokens[index]?.value !== ",") break;
    index += 1;
  }
  index = expectSymbol(tokens, index, ")");
  if (index !== tokens.length || valueCount !== columns.length) {
    throw new SqlQueryValidationError("Lab menerima satu baris INSERT dengan daftar kolom dan nilai yang sepadan.");
  }
  return { kind: "mutation", action: "INSERT", table: table.name };
}

function parseUpdate(tokens: Token[], dataset: PracticeDataset): SqlMutation {
  const table = supportedTable(tokens[1], dataset);
  if (!table) throw new SqlQueryValidationError(`Pilih tabel pada skema ${dataset.title}: ${dataset.tables.map((item) => item.name).join(", ")}.`);
  let index = expectWord(tokens, 2, "set");
  const column = word(tokens[index]);
  if (!column || !table.columns.some((item) => item.name === column) || column === primaryKey(table)) {
    throw new SqlQueryValidationError("UPDATE hanya dapat mengubah satu kolom non-key.");
  }
  index += 1;
  index = expectSymbol(tokens, index, "=");
  index = parseLiteral(tokens, index);
  index = expectWord(tokens, index, "where");
  if (word(tokens[index]) !== primaryKey(table)) {
    throw new SqlQueryValidationError(`WHERE harus menargetkan primary key ${primaryKey(table)}.`);
  }
  index += 1;
  index = expectSymbol(tokens, index, "=");
  if (tokens[index]?.kind !== "number" || !/^\d+$/.test(tokens[index]!.value)) {
    throw new SqlQueryValidationError("Target UPDATE harus satu primary key berupa angka bulat.");
  }
  index += 1;
  if (index !== tokens.length) throw new SqlQueryValidationError("UPDATE hanya menerima satu nilai dan satu target record.");
  return { kind: "mutation", action: "UPDATE", table: table.name };
}

function parseDelete(tokens: Token[], dataset: PracticeDataset): SqlMutation {
  let index = expectWord(tokens, 1, "from");
  const table = supportedTable(tokens[index], dataset);
  if (!table) throw new SqlQueryValidationError(`Pilih tabel pada skema ${dataset.title}: ${dataset.tables.map((item) => item.name).join(", ")}.`);
  index += 1;
  index = expectWord(tokens, index, "where");
  if (word(tokens[index]) !== primaryKey(table)) {
    throw new SqlQueryValidationError(`WHERE harus menargetkan primary key ${primaryKey(table)}.`);
  }
  index += 1;
  index = expectSymbol(tokens, index, "=");
  if (tokens[index]?.kind !== "number" || !/^\d+$/.test(tokens[index]!.value)) {
    throw new SqlQueryValidationError("Target DELETE harus satu primary key berupa angka bulat.");
  }
  index += 1;
  if (index !== tokens.length) throw new SqlQueryValidationError("DELETE hanya menerima satu target record.");
  return { kind: "mutation", action: "DELETE", table: table.name };
}

export function inspectSqlStatement(source: string, dataset: PracticeDataset = CAMPUS_DATASET): SqlStatement {
  const query = source.trim();
  if (!query || query.length > MAX_QUERY_LENGTH) {
    throw new SqlQueryValidationError(`Query harus berisi paling banyak ${MAX_QUERY_LENGTH.toLocaleString("id-ID")} karakter.`);
  }
  const body = stripFinalSemicolon(query);
  const tokens = tokenize(body);
  if (word(tokens[0], "select")) return { kind: "select" };
  if (word(tokens[0], "insert")) return parseInsert(tokens, dataset);
  if (word(tokens[0], "update")) return parseUpdate(tokens, dataset);
  if (word(tokens[0], "delete")) return parseDelete(tokens, dataset);
  throw new SqlQueryValidationError("Lab menerima query SELECT dan satu baris INSERT, UPDATE, atau DELETE yang dibatasi.");
}

export function validateSqlStatement(source: string, dataset: PracticeDataset = CAMPUS_DATASET): SqlStatement {
  return inspectSqlStatement(source, dataset);
}

export const QUERY_TRACE_STEPS = [
  { title: "Sumber", clause: "FROM", description: "FROM menentukan tabel tempat SQLite membaca data." },
  { title: "Relasi dan filter", clause: "JOIN / WHERE", description: "JOIN memasangkan record melalui key; WHERE menyaring baris jika digunakan." },
  { title: "Kolom", clause: "SELECT", description: "SELECT menentukan kolom yang akan ditampilkan." },
  { title: "Hasil", clause: "SQLite", description: "Tabel hasil menunjukkan baris yang dikembalikan query." },
] as const;

export function clampTraceStep(step: number): number {
  return Math.max(0, Math.min(QUERY_TRACE_STEPS.length - 1, step));
}
