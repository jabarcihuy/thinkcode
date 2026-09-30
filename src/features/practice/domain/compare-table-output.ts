import { normalizeOutput } from "./normalize-output";

/** Only enabled by private SQL exercise configuration. Rows and columns stay ordered. */
export function compareTableOutput(actual: string, expected: string, columnTypes: readonly string[]): boolean {
  const parse = (value: string) => normalizeOutput(value).split("\n").map((line) => line.split("|").map((cell) => cell.trim()));
  const actualRows = parse(actual), expectedRows = parse(expected);
  if (actualRows.length !== expectedRows.length) return false;
  const numeric = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$/;
  return expectedRows.every((row, index) => {
    const received = actualRows[index]!;
    if (row.length !== columnTypes.length || received.length !== row.length) return false;
    return row.every((cell, column) => {
      const value = received[column]!;
      if (columnTypes[column] !== "number") return value === cell;
      return numeric.test(value) && numeric.test(cell) && Number.isFinite(Number(value)) && Number(value) === Number(cell);
    });
  });
}
