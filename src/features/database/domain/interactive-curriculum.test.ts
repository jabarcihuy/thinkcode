import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { gradeExercise } from "@/features/practice/domain/grade-exercise";
import type { GradingExercise } from "@/features/practice/types";
import type { SubmissionInput } from "@/features/practice/validation/submission";
import type { Json } from "@/types/database";

type SeedExercise = { type: GradingExercise["type"]; is_required: boolean; position: number; config: { public: Record<string, Json>; answer: NonNullable<SubmissionInput["answer"]>; feedback: { retry: string } } };
type SeedLesson = { slug: string; example_sql: string | null; content: string; exercises: SeedExercise[] };
const migration = readFileSync("supabase/migrations/20260930114229_interactive_campus_curriculum.sql", "utf8");
const payload = migration.match(/\$curriculum\$([\s\S]*?)\$curriculum\$/)?.[1];
if (!payload) throw new Error("Missing curriculum fixture");
const lessons = JSON.parse(payload) as SeedLesson[];

describe("interactive course contract", () => {
  it("preserves the original 11-lesson seed with 33 anchor checks", () => {
    expect(lessons).toHaveLength(11);
    expect(lessons.flatMap((lesson) => lesson.exercises)).toHaveLength(33);
    for (const lesson of lessons) {
      expect(lesson.exercises.filter((exercise) => exercise.is_required)).toHaveLength(1);
      expect(lesson.exercises.map((exercise) => exercise.position)).toEqual([1, 2, 3]);
      expect(lesson.exercises[2].is_required).toBe(true);
    }
  });
  it("keeps relation seed lessons free of SQL", () => {
    for (const lesson of lessons.slice(0, 2)) {
      expect(lesson.example_sql).toBeNull();
      expect(lesson.content).not.toContain("```sql");
      expect(lesson.content).toContain("2D");
    }
  });
  it.each(lessons.map((lesson) => [lesson.slug, lesson] as const))("has valid private answer keys and safe public configuration: %s", (_, lesson) => {
    for (const [index, exercise] of lesson.exercises.entries()) {
      expect(Object.keys(exercise.config.public)).not.toContain("answer");
      expect(Object.keys(exercise.config.public)).not.toContain("feedback");
      expect(Object.keys(exercise.config.public)).not.toContain("grading");
      expect(exercise.config.public.subtopic).toBeTypeOf("string");
      const gradingExercise: GradingExercise = { id: `seed-${index}`, lessonId: lesson.slug, type: exercise.type, config: exercise.config, tests: [] };
      const submission: SubmissionInput = { pathSlug: "database-fundamentals", sourceCode: null, runResults: null, answer: exercise.config.answer };
      const result = gradeExercise(gradingExercise, submission);
      expect(result.passed).toBe(true);
      expect(result.visibleTests).toEqual([]);
      const wrong = "output" in exercise.config.answer ? { output: "WRONG" } : "choiceId" in exercise.config.answer ? { choiceId: "WRONG" } : { order: ("order" in exercise.config.answer ? [...exercise.config.answer.order].reverse() : []) };
      const failed = gradeExercise(gradingExercise, { ...submission, answer: wrong });
      expect(failed.passed).toBe(false);
      expect(failed.feedback).toBe(exercise.config.feedback.retry);
    }
  });
});
