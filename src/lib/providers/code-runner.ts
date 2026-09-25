export const JAVASCRIPT_LANGUAGE = { displayName: "JavaScript", slug: "javascript", runtime: "browser" } as const;

export interface TraceStep {
  line: number;
  event: "variables" | "condition" | "iteration" | "function_call" | "return" | "array_access" | "output";
  variables: Record<string, string | number | boolean | null | Array<string | number | boolean | null>>;
  condition?: boolean;
  output?: string;
  iteration?: number;
  function?: string;
  arrayAccess?: { array: string; index: string | number; value: string | number | boolean | null };
}

export interface ExecutionTrace { steps: TraceStep[]; truncated: boolean }

export interface CodeRunInput {
  language: typeof JAVASCRIPT_LANGUAGE.slug;
  sourceCode: string;
  stdin?: string;
  timeoutMs?: number;
  visualize?: boolean;
}

export interface CodeRunResult {
  status: "success" | "syntax_error" | "runtime_error" | "timeout" | "internal_error";
  stdout: string;
  stderr: string;
  executionTimeMs: number | null;
  trace: ExecutionTrace;
  outputTruncated: boolean;
}

export interface CodeRunner {
  run(input: CodeRunInput): Promise<CodeRunResult>;
}
