import { it, expect } from "vitest";
import { generateSqlabDraft } from "./generate";
import { fixture } from "../domain/test-fixture";
import type { AIProvider } from "@/lib/providers/ai-provider";
function provider(text: string): AIProvider {
  return {
    generate: async () => ({ content: text }),
    async *stream(input) {
      expect(input.maxOutputTokens).toBe(4000);
      yield text;
    },
  };
}
it("generates a validated draft without SQL execution", async () => {
  expect(
    await generateSqlabDraft(
      provider(JSON.stringify(fixture)),
      "Buat perpustakaan",
    ),
  ).toEqual(fixture);
});
it("rejects invalid AI output and oversized generation", async () => {
  await expect(
    generateSqlabDraft(provider('{"sql":"DROP TABLE profiles"}'), "database"),
  ).rejects.toThrow();
  await expect(
    generateSqlabDraft(provider("x".repeat(30_001)), "database"),
  ).rejects.toThrow();
});
