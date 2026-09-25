import "server-only";
import { getQuickJS } from "quickjs-emscripten";
import type { AssessmentCodeRunInput, AssessmentCodeRunResult, AssessmentRunner } from "@/features/assessment/domain/assessment-runner";

const MAX_SOURCE_CHARS = 16_000;
const MAX_STDIN_CHARS = 4_000;
const MAX_OUTPUT_CHARS = 8_000;
const MAX_OUTPUT_LINES = 100;
const MAX_TIMEOUT_MS = 1_500;

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  try { return JSON.stringify(value) ?? String(value); }
  catch { return "[value]"; }
}

function readError(context: ReturnType<Awaited<ReturnType<typeof getQuickJS>>["newContext"]>, handle: Parameters<typeof context.dump>[0]): string {
  const nameHandle = context.getProp(handle, "name");
  const messageHandle = context.getProp(handle, "message");
  const name = String(context.dump(nameHandle) ?? "Error");
  const message = String(context.dump(messageHandle) ?? "Execution failed.");
  nameHandle.dispose(); messageHandle.dispose();
  return `${name}: ${message}`.slice(0, 1000);
}

export class QuickJSSandboxAdapter implements AssessmentRunner {
  async run(input: AssessmentCodeRunInput): Promise<AssessmentCodeRunResult> {
    const start = Date.now();
    const sourceCode = input.sourceCode.slice(0, MAX_SOURCE_CHARS);
    const stdin = (input.stdin ?? "").slice(0, MAX_STDIN_CHARS);
    const timeoutMs = Math.min(Math.max(input.timeoutMs ?? MAX_TIMEOUT_MS, 50), MAX_TIMEOUT_MS);
    const output = { stdout: "", stderr: "", outputTruncated: false, timedOut: false };
    let runtime: ReturnType<Awaited<ReturnType<typeof getQuickJS>>["newRuntime"]> | undefined;
    let context: ReturnType<NonNullable<typeof runtime>["newContext"]> | undefined;

    const append = (field: "stdout" | "stderr", values: unknown[]) => {
      if (output.outputTruncated) return;
      const value = values.map(formatValue).join(" ");
      const current = output[field];
      const separator = current ? "\n" : "";
      if (current.length + separator.length + value.length > MAX_OUTPUT_CHARS || current.split("\n").length >= MAX_OUTPUT_LINES) {
        output.outputTruncated = true;
        output[field] = `${current}${current ? "\n" : ""}[Output dibatasi]`.slice(0, MAX_OUTPUT_CHARS);
        return;
      }
      output[field] = `${current}${separator}${value}`;
    };

    try {
      const quickjs = await getQuickJS();
      runtime = quickjs.newRuntime();
      runtime.setMemoryLimit(16 * 1024 * 1024);
      runtime.setMaxStackSize(512 * 1024);
      const deadline = start + timeoutMs;
      runtime.setInterruptHandler(() => {
        if (Date.now() < deadline) return false;
        output.timedOut = true;
        return true;
      });
      context = runtime.newContext();

      const consoleObject = context.newObject();
      const log = context.newFunction("log", (...args) => { append("stdout", args.map((item) => context!.dump(item))); return context!.undefined; });
      const error = context.newFunction("error", (...args) => { append("stderr", args.map((item) => context!.dump(item))); return context!.undefined; });
      context.setProp(consoleObject, "log", log);
      context.setProp(consoleObject, "error", error);
      context.setProp(context.global, "console", consoleObject);
      const inputHandle = context.newString(stdin);
      context.setProp(context.global, "input", inputHandle);
      inputHandle.dispose();
      consoleObject.dispose(); log.dispose(); error.dispose();

      const callSource = input.entryFunction
        ? `\n;globalThis.__thinkcode_result = ${input.entryFunction}(...${JSON.stringify(input.args ?? [])});`
        : "";
      const result = context.evalCode(`${sourceCode}${callSource}`, "assessment.js");
      if (result.error) {
        const detail = readError(context, result.error);
        result.error.dispose();
        return {
          status: output.timedOut ? "timeout" : detail.startsWith("SyntaxError:") ? "syntax_error" : "runtime_error",
          stdout: output.stdout, stderr: output.timedOut ? "Execution time limit exceeded." : detail,
          returnedValue: undefined, executionTimeMs: Date.now() - start, outputTruncated: output.outputTruncated,
        };
      }
      result.value.dispose();
      let returnedValue: unknown = undefined;
      if (input.entryFunction) {
        const valueHandle = context.getProp(context.global, "__thinkcode_result");
        returnedValue = context.dump(valueHandle);
        valueHandle.dispose();
      }
      return {
        status: output.timedOut ? "timeout" : output.outputTruncated ? "output_limited" : "success",
        stdout: output.stdout, stderr: output.timedOut ? "Execution time limit exceeded." : output.stderr,
        returnedValue, executionTimeMs: Date.now() - start, outputTruncated: output.outputTruncated,
      };
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : "Sandbox error.";
      return {
        status: output.timedOut ? "timeout" : "runtime_error", stdout: output.stdout,
        stderr: output.timedOut ? "Execution time limit exceeded." : detail.slice(0, 1000),
        returnedValue: undefined, executionTimeMs: Date.now() - start, outputTruncated: output.outputTruncated,
      };
    } finally {
      context?.dispose();
      runtime?.dispose();
    }
  }
}
