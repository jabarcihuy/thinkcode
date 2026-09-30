import { describe, expect, it } from "vitest";
import { compareTableOutput } from "./compare-table-output";

describe("SQL table prediction", () => {
  it("accepts separator spacing, CRLF, a final newline, and equivalent numbers", () => {
    expect(compareTableOutput("Basis Data| 2 |85.00\r\n", "Basis Data | 2 | 85", ["text", "number", "number"])).toBe(true);
  });
  it.each(["BasisData | 2 | 85", "Basis Data | 3 | 85", "Basis Data | 2 | 85.1", "Basis Data | 2 | NaN", "Basis Data | 2", "Basis Data | 2 | 85 | extra"])("rejects incorrect cells or shape: %s", (actual) => {
    expect(compareTableOutput(actual, "Basis Data | 2 | 85", ["text", "number", "number"])).toBe(false);
  });
  it("preserves requested row order and interior text spaces", () => {
    expect(compareTableOutput("B | 2\nA | 1", "A | 1\nB | 2", ["text", "number"])).toBe(false);
    expect(compareTableOutput("Basis  Data | 85", "Basis Data | 85", ["text", "number"])).toBe(false);
  });
});
