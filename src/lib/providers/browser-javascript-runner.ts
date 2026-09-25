"use client";

import type { CodeRunner, CodeRunInput, CodeRunResult } from "@/lib/providers/code-runner";
import { sandboxDocument } from "@/features/workspace/browser/sandbox-document";
import { instrumentJavaScript } from "@/features/workspace/browser/trace-generator";

function failure(status: CodeRunResult["status"], message: string): CodeRunResult {
  return { status, stdout: "", stderr: message, executionTimeMs: null, trace: { steps: [], truncated: false }, outputTruncated: false };
}

function isRunResult(value: unknown): value is CodeRunResult {
  return typeof value === "object" && value !== null && "status" in value &&
    ["success", "syntax_error", "runtime_error", "timeout", "internal_error"].includes(String(value.status)) &&
    "stdout" in value && typeof value.stdout === "string" && value.stdout.length <= 8000 &&
    "stderr" in value && typeof value.stderr === "string" && value.stderr.length <= 8000 &&
    "trace" in value && typeof value.trace === "object" && value.trace !== null &&
    "steps" in value.trace && Array.isArray(value.trace.steps) && value.trace.steps.length <= 200;
}

export class BrowserJavaScriptRunner implements CodeRunner {
  async run(input: CodeRunInput): Promise<CodeRunResult> {
    if (input.language !== "javascript" || !input.sourceCode.trim() || input.sourceCode.length > 16_000 || (input.stdin?.length ?? 0) > 4_000) {
      return failure("internal_error", "Kode atau input tidak valid.");
    }
    let source = input.sourceCode;
    if (input.visualize) {
      try { source = instrumentJavaScript(source); }
      catch (error) { return failure("syntax_error", error instanceof Error ? error.message.slice(0, 1000) : "Sintaks JavaScript tidak valid."); }
    }
    const id = crypto.randomUUID();
    const frame = document.createElement("iframe");
    frame.setAttribute("sandbox", "allow-scripts");
    frame.setAttribute("aria-hidden", "true");
    frame.setAttribute("referrerpolicy", "no-referrer");
    frame.style.display = "none";
    frame.srcdoc = sandboxDocument;
    const timeoutMs = Math.min(Math.max(input.timeoutMs ?? 1500, 100), 3000);
    return await new Promise<CodeRunResult>((resolve) => {
      let done = false;
      const finish = (result: CodeRunResult) => {
        if (done) return;
        done = true;
        clearTimeout(parentTimer);
        window.removeEventListener("message", onMessage);
        frame.contentWindow?.postMessage({ kind: "stop", id }, "*");
        frame.remove();
        resolve(result);
      };
      const onMessage = (event: MessageEvent) => {
        if (event.source !== frame.contentWindow || event.data?.id !== id) return;
        if (event.data.kind === "timeout") finish(failure("timeout", "Execution stopped: time limit exceeded."));
        else if (event.data.kind === "error") finish(failure("internal_error", "Sandbox gagal menjalankan kode."));
        else if (event.data.kind === "result") finish(isRunResult(event.data.result) ? event.data.result : failure("internal_error", "Respons sandbox tidak valid."));
      };
      const parentTimer = window.setTimeout(() => finish(failure("timeout", "Execution stopped: time limit exceeded.")), timeoutMs + 400);
      window.addEventListener("message", onMessage);
      frame.onload = () => frame.contentWindow?.postMessage({ kind: "run", id, source, input: input.stdin ?? "", visualize: Boolean(input.visualize), timeoutMs }, "*");
      document.body.append(frame);
    });
  }
}
