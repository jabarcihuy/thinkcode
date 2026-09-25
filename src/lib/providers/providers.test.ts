import { describe, expect, it } from "vitest";
import type { AIProvider } from "./ai-provider";
import type { CodeRunner } from "./code-runner";

describe("provider contracts", () => {
  it("lets a code runner implementation be exchanged through the interface", async () => {
    const runner: CodeRunner = { run: async () => ({ status: "success", stdout: "ok", stderr: "", executionTimeMs: 10, trace: { steps: [], truncated: false }, outputTruncated: false }) };
    expect((await runner.run({ language: "javascript", sourceCode: "console.log('ok')" })).stdout).toBe("ok");
  });

  it("supports generated and streamed AI responses without a vendor SDK", async () => {
    const provider: AIProvider = {
      generate: async () => ({ content: "hint" }),
      async *stream() { yield "hint"; },
    };
    expect((await provider.generate({ messages: [{ role: "user", content: "Help" }] })).content).toBe("hint");
    const chunks = [];
    for await (const chunk of provider.stream({ messages: [] })) chunks.push(chunk);
    expect(chunks).toEqual(["hint"]);
  });
});
