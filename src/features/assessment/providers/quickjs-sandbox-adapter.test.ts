import { describe, expect, it } from "vitest";
import { QuickJSSandboxAdapter } from "@/features/assessment/providers/quickjs-sandbox-adapter";

const runner = new QuickJSSandboxAdapter();

describe("QuickJS assessment sandbox", () => {
  it("runs a JavaScript function and captures its returned value", async () => {
    const result = await runner.run({ sourceCode: "function sum(a, b) { return a + b; }", entryFunction: "sum", args: [2, 3] });
    expect(result.status).toBe("success");
    expect(result.returnedValue).toBe(5);
  });

  it("runs a string-returning function with JSON test arguments", async () => {
    const result = await runner.run({ sourceCode: 'function greet(name) { return "Halo, " + name + "!"; }', entryFunction: "greet", args: ["Ayu"] });
    expect(result.status).toBe("success");
    expect(result.returnedValue).toBe("Halo, Ayu!");
  });

  it("captures output and does not expose Node or network capabilities", async () => {
    const result = await runner.run({ sourceCode: 'console.log("ok"); console.log(typeof process, typeof require, typeof fetch);' });
    expect(result.status).toBe("success");
    expect(result.stdout).toBe("ok\nundefined undefined undefined");
  });

  it("separates syntax and runtime errors", async () => {
    expect((await runner.run({ sourceCode: "if (" })).status).toBe("syntax_error");
    const runtime = await runner.run({ sourceCode: "throw new Error('broken')" });
    expect(runtime.status).toBe("runtime_error");
    expect(runtime.stderr).toContain("broken");
  });

  it("interrupts infinite loops and limits output", async () => {
    const started = Date.now();
    const timeout = await runner.run({ sourceCode: "while (true) {}", timeoutMs: 100 });
    expect(timeout.status).toBe("timeout");
    expect(Date.now() - started).toBeLessThan(1500);

    const largeOutput = await runner.run({ sourceCode: 'console.log("x".repeat(9000))' });
    expect(largeOutput.outputTruncated).toBe(true);
    expect(largeOutput.stdout.length).toBeLessThanOrEqual(8_000);
  });
});
