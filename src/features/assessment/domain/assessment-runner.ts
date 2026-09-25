export interface AssessmentCodeRunInput {
  sourceCode: string;
  stdin?: string;
  timeoutMs?: number;
  entryFunction?: string;
  args?: unknown[];
}

export interface AssessmentCodeRunResult {
  status: "success" | "syntax_error" | "runtime_error" | "timeout" | "output_limited";
  stdout: string;
  stderr: string;
  returnedValue: unknown;
  executionTimeMs: number;
  outputTruncated: boolean;
}

export interface AssessmentRunner {
  run(input: AssessmentCodeRunInput): Promise<AssessmentCodeRunResult>;
}
