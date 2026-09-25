import type { Database, Json } from "@/types/database";

export type AssessmentType = "CHECKPOINT" | "FINAL";
export type AssessmentItemType = Database["public"]["Enums"]["exercise_type"];
export type AssessmentStatus = "IN_PROGRESS" | "COMPLETED" | "ABANDONED";

export type AssessmentAnswer =
  | { sourceCode: string }
  | { output: string }
  | { choiceId: string }
  | { order: string[] };

export interface PublicAssessmentItem {
  id: string;
  type: AssessmentItemType;
  title: string;
  topic: string;
  prompt: string;
  starterCode: string | null;
  publicConfig: Json;
  position: number;
}

export interface AssessmentTestCase {
  args: Json;
  stdin: string;
  expectedOutput: string;
  isHidden: boolean;
  weight: number;
  position: number;
}

export interface PrivateAssessmentItem extends PublicAssessmentItem {
  answerConfig: Json;
  entryFunction: string | null;
  weight: number;
  tests: AssessmentTestCase[];
}

export interface AssessmentItemResult {
  itemId: string;
  topic: string;
  passed: boolean;
  score: number;
  passedTests: number;
  totalTests: number;
  hiddenPassed: number;
  hiddenTotal: number;
  visibleTests: Array<{ position: number; passed: boolean }>;
}

export interface AssessmentGrade {
  score: number;
  passed: boolean;
  totalCorrect: number;
  totalItems: number;
  hiddenPassed: number;
  hiddenTotal: number;
  itemResults: AssessmentItemResult[];
  topicSummary: Array<{ topic: string; passed: boolean }>;
}
