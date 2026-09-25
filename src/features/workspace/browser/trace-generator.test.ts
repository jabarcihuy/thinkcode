import { describe, expect, it } from "vitest";
import { instrumentJavaScript } from "./trace-generator";
import { nextTraceIndex, previousTraceIndex, clampTraceIndex } from "@/features/workspace/components/execution-visualizer";

describe("trace generation", () => {
  it("instruments variables, conditions, loops, functions, and returns", () => {
    const source = 'let x = 2; x += 3; const values = [5, 8, 3]; if (x > 4) { console.log(values[1]); } for (let i = 0; i < 2; i++) { x += i; } function add(a) { return a + x; } console.log(add(1));';
    const result = instrumentJavaScript(source);
    expect(result).toContain('__tcTrace');
    expect(result).toContain('__tcCondition');
    expect(result).toContain('__tcReturn');
    expect(result).toContain('"function_call"');
    expect(result).toContain('"iteration"');
    expect(result).toContain('__tcArrayAccess');
    expect(() => new Function("__tcTrace", "__tcCondition", "__tcReturn", "__tcArrayAccess", result)).not.toThrow();
    expect(() => new Function("__tcTrace", "__tcCondition", "__tcReturn", "__tcArrayAccess", instrumentJavaScript('console.log("one"); console.log("two"); console.error("warning");'))).not.toThrow();
    expect(() => new Function("__tcTrace", "__tcCondition", "__tcReturn", "__tcArrayAccess", instrumentJavaScript('let x = 1; if (x) console.log("yes"); else console.log("no");'))).not.toThrow();
  });
  it("rejects invalid syntax before sandbox execution", () => {
    expect(() => instrumentJavaScript("let = ;")).toThrow();
  });
});

describe("trace controls", () => {
  it("moves within bounds and resets to the first step", () => {
    expect(nextTraceIndex(0, 3)).toBe(1);
    expect(previousTraceIndex(0, 3)).toBe(0);
    expect(nextTraceIndex(2, 3)).toBe(2);
    expect(clampTraceIndex(0, 3)).toBe(0);
  });
});
