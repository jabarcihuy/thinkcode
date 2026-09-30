import { describe, expect, it } from "vitest";
import { getLessonLabPrompt } from "@/features/database/domain/lesson-lab-guidance";

describe("getLessonLabPrompt", () => {
  it("prompts learners to predict and inspect read query results", () => {
    expect(getLessonLabPrompt("SELECT name FROM students;"))
      .toContain("prediksi jumlah baris");
  });

  it.each([
    ["INSERT INTO students (student_id, name, cohort) VALUES (5, 'Eka', '2026');", "pasangan kolom dan nilai"],
    ["UPDATE enrollments SET score = 78 WHERE enrollment_id = 3;", "primary key"],
    ["DELETE FROM enrollments WHERE enrollment_id = 6;", "foreign key"],
  ])("gives a safe, action-specific task for %s", (sql, expected) => {
    expect(getLessonLabPrompt(sql)).toContain(expected);
  });

  it("falls back to clear guidance for an invalid starter", () => {
    expect(getLessonLabPrompt("not sql")).toContain("Ubah query");
  });
});
