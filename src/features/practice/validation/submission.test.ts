import { describe, expect, it } from "vitest";
import { parseSubmission } from "./submission";

describe("exercise submission validation", () => {
  it("rejects oversized source and malformed answers", () => {
    expect(parseSubmission("CODE_COMPLETION", { pathSlug: "path", sourceCode: "x".repeat(16_001) })).toBeNull();
    expect(parseSubmission("PREDICT_OUTPUT", { pathSlug: "path", answer: { value: "wrong shape" } })).toBeNull();
    expect(parseSubmission("FLOWCHART", { pathSlug: "path", answer: { order: ["same", "same"] } })).toBeNull();
  });
});
