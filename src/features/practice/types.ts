import type { Database, Json } from "@/types/database";

export type ExerciseType = Database["public"]["Enums"]["exercise_type"];

export interface VisibleTest {
  id: string;
  stdin: string;
  expectedOutput: string;
  position: number;
}

export interface PublicExercise {
  id: string;
  lessonId: string;
  type: ExerciseType;
  title: string;
  prompt: string;
  starterCode: string | null;
  publicConfig: Json | null;
  position: number;
  isRequired: boolean;
  passed: boolean;
  visibleTests: VisibleTest[];
}

export interface GradingTest {
  stdin: string;
  expectedOutput: string;
  isHidden: boolean;
  weight: number;
  position: number;
}

export interface GradingExercise {
  id: string;
  lessonId: string;
  type: ExerciseType;
  config: Json;
  tests: GradingTest[];
}

export interface VisibleTestResult {
  position: number;
  passed: boolean;
  status: "success" | "syntax_error" | "runtime_error" | "timeout" | "internal_error";
  actualOutput: string;
  expectedOutput: string;
  detail: string;
}

export interface ClientTestResult {
  position: number;
  status: VisibleTestResult["status"];
  stdout: string;
  stderr: string;
}

export interface GradeResult {
  passed: boolean;
  score: number;
  feedback: string;
  visibleTests: VisibleTestResult[];
  hiddenPassed: number;
  hiddenTotal: number;
  lessonCompleted?: boolean;
}
