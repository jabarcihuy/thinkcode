import type { z } from "zod";
import type { tutorRequestSchema } from "@/features/ai/validation/tutor-request";

export type TutorRequest = z.infer<typeof tutorRequestSchema>;

export interface TutorContextTools {
  getCurrentLesson(): Promise<unknown>;
  getCurrentExercise(): Promise<unknown>;
  readStudentCode(): string;
  readVisibleOutput(): string;
  getExecutionTrace(): string;
  getStudentProgress(): Promise<string>;
  runPracticeCode(): "Use Run in the browser workspace first.";
  runVisiblePracticeChecks(): "Use Check in the browser workspace first.";
  generateSimilarPractice(): "The tutor can generate a similar prompt without saving or grading it.";
}
