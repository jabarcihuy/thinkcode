import { describe, expect, it } from "vitest";
import { createTutorMessages, isExplicitSolutionRequest, nextHintLevel, type TutorSnapshot } from "./tutor-context";

const snapshot: TutorSnapshot = {
  lesson: { title: "JOIN tabel", summary: "Hubungkan data", content: "Gunakan key untuk menggabungkan record." },
  exercise: { title: "Prediksi hasil JOIN", type: "PREDICT_OUTPUT", prompt: "Prediksi baris hasil query." },
  sourceCode: "SELECT students.name, courses.course_name FROM enrollments JOIN students USING (student_id) JOIN courses USING (course_id);",
  visibleOutput: "Alya | Basis Data",
  visibleTestResults: [{ position: 1, passed: true }],
  progressSummary: "3 of 8 required lessons complete",
};

describe("AI tutor context and hints", () => {
  it("includes the current lesson, SQL and visible result", () => {
    const messages = createTutorMessages(snapshot, [], "Jelaskan hasil", "explain_result", 1);
    expect(messages[0].content).toContain("JOIN tabel");
    expect(messages[0].content).toContain(snapshot.sourceCode);
    expect(messages[0].content).toContain(snapshot.visibleOutput);
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
