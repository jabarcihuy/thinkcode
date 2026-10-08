import { describe, expect, it } from "vitest";
import { isTestAvailable, summarizeTopics, testPolicy } from "./test-policy";

describe("diagnostic and post-test policy", () => {
  it("never offers retired diagnostics", () => {
    expect(isTestAvailable("PRETEST", false, false)).toBe(false);
    expect(testPolicy("PRETEST")).toEqual({ diagnostic: true, canRetry: false, countsForGrade: false });
  });
  it("keeps a recorded baseline immutable", () => {
    expect(isTestAvailable("PRETEST", true, true)).toBe(false);
  });
  it("requires reading for post-test, never a pre-test pass", () => {
    expect(isTestAvailable("FINAL", false, true)).toBe(false);
    expect(isTestAvailable("FINAL", true, false)).toBe(true);
    expect(testPolicy("FINAL").canRetry).toBe(true);
  });
  it("aggregates topics rather than repeating one label per question", () => {
    expect(summarizeTopics([{ topic: "Relasi", passed: true }, { topic: "Relasi", passed: false }, { topic: "Read", passed: true }]))
      .toEqual([{ topic: "Relasi", correct: 1, total: 2 }, { topic: "Read", correct: 1, total: 1 }]);
  });
});
