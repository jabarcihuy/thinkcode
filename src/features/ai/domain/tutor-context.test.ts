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
  it("sets a beginner-friendly, grounded database tutor policy in the selected language", () => {
    const prompt = createTutorMessages(snapshot, [], "Why?", "message", 1, "id")[0].content;
    expect(prompt).toContain("Bahasa Indonesia");
    expect(prompt).toContain("first-semester");
    expect(prompt).toContain("SQLite");
    expect(prompt).toContain("untrusted data");
    expect(prompt).toContain("previewing the target rows");
    expect(prompt).toContain("you have not executed anything");
  });

  it("bounds individual context fields without dropping the learner query", () => {
    const large = { ...snapshot, lesson: { ...snapshot.lesson, content: "x".repeat(30000) } };
    const messages = createTutorMessages(large, Array.from({ length: 12 }, () => ({ role: "user" as const, content: "y".repeat(3000) })), "z".repeat(2000), "hint", 2);
    expect(messages[0].content).toContain(snapshot.sourceCode);
    expect(messages[0].content).not.toContain("x".repeat(6001));
    expect(messages).toHaveLength(10);
    expect(messages[1].content).toHaveLength(1500);
    expect(messages[9].content).toHaveLength(1200);
  });

});
