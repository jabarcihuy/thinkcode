import type { SqlAssessmentKey } from "../server/sql-assessment-key";
import type { SqlAssessmentConfig } from "../validation/sql-assessment";
export interface SqlAssessmentResult {
  passedTests: number; totalTests: number; hiddenPassed: number; hiddenTotal: number;
  visibleTests: Array<{ position: number; passed: boolean }>;
}
export interface SqlAssessmentRunner {
  grade(query: string, config: SqlAssessmentConfig, key: SqlAssessmentKey): Promise<SqlAssessmentResult>;
}
