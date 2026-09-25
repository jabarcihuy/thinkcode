import { describe, expect, it } from "vitest";
import { createTutorMessages, isExplicitSolutionRequest, nextHintLevel, type TutorSnapshot } from "./tutor-context";

const snapshot: TutorSnapshot = {
  lesson: { title: "Loops", summary: "Repeat steps", content: "A loop repeats code." },
  exercise: { title: "Count", type: "CODE_COMPLETION", prompt: "Print 0 to 2" },
  sourceCode: "for (let i = 0; i < 3; i++) console.log(i)",
  visibleOutput: "0\n1\n2",
  visibleTestResults: [{ position: 1, passed: true }],
  traceSummary: "i: 0 → 1 → 2",
  progressSummary: "3 of 8 required lessons complete",
};

describe("AI tutor context and hints", () => {
  it("includes the current lesson, code and visualizer trace", () => {
    const messages = createTutorMessages(snapshot, [], "Explain the loop", "explain_trace", 1);
    expect(messages[0].content).toContain("Loops");
    expect(messages[0].content).toContain(snapshot.sourceCode);
    expect(messages[0].content).toContain(snapshot.traceSummary);
  });

  it("escalates hints up to level four", () => {
    expect(nextHintLevel("hint", 0, false)).toBe(1);
    expect(nextHintLevel("hint", 2, false)).toBe(3);
    expect(nextHintLevel("hint", 4, false)).toBe(4);
  });

  it("only enables level five for an explicit solution request", () => {
    expect(isExplicitSolutionRequest("Kenapa salah?", "why_wrong")).toBe(false);
    expect(isExplicitSolutionRequest("Berikan solusi lengkap", "message")).toBe(true);
    expect(nextHintLevel("message", 2, false)).toBe(2);
    expect(nextHintLevel("message", 2, true)).toBe(5);
  });
});
