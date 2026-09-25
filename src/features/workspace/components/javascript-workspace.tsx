"use client";

import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { normalizeOutput } from "@/features/practice/domain/normalize-output";
import { BrowserJavaScriptRunner } from "@/lib/providers/browser-javascript-runner";
import type { CodeRunResult } from "@/lib/providers/code-runner";
import { JavaScriptEditor } from "@/features/workspace/components/javascript-editor";
import { OutputPanel } from "@/features/workspace/components/output-panel";
import { ExecutionVisualizer } from "@/features/workspace/components/execution-visualizer";

const runner = new BrowserJavaScriptRunner();

export function JavaScriptWorkspace({ starterCode, title = "JavaScript Lab" }: { starterCode: string; title?: string }) {
  const [code, setCode] = useState(starterCode);
  const [stdin, setStdin] = useState("");
  const [prediction, setPrediction] = useState("");
  const [predictionAtRun, setPredictionAtRun] = useState<string | null>(null);
  const [result, setResult] = useState<CodeRunResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [tab, setTab] = useState<"code" | "result">("code");

  async function runCode() {
    if (pending) return;
    setPending(true); setResult(null); setRunError(null); setPredictionAtRun(prediction); setShowTrace(false); setTab("result");
    try { setResult(await runner.run({ language: "javascript", sourceCode: code, stdin, visualize: true })); }
    catch { setRunError("The browser sandbox could not start. Try again or refresh the page."); }
    finally { setPending(false); }
  }

  return <section aria-label={title} className="mt-12 border-t border-border pt-8">
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold tracking-tight">{title}</h2><p className="mt-1 text-sm text-muted-foreground">Satu berkas: main.js. Run terjadi di browser dan tidak mengubah progres.</p></div><Button type="button" variant="outline" onClick={() => { setCode(starterCode); setResult(null); setPrediction(""); setShowTrace(false); setTab("code"); }}><RotateCcw size={15} aria-hidden="true" />Reset</Button></div>
    <div role="tablist" aria-label="Workspace panels" className="mb-4 flex gap-2 md:hidden">
      <button id="workspace-code-tab" type="button" role="tab" aria-controls="workspace-code-panel" aria-selected={tab === "code"} onClick={() => setTab("code")} className={`min-h-11 rounded-md px-4 text-sm font-semibold ${tab === "code" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Code</button>
      <button id="workspace-result-tab" type="button" role="tab" aria-controls="workspace-result-panel" aria-selected={tab === "result"} onClick={() => setTab("result")} className={`min-h-11 rounded-md px-4 text-sm font-semibold ${tab === "result" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Result</button>
    </div>
    <div className="grid gap-5 md:grid-cols-[minmax(0,1.5fr)_minmax(16rem,1fr)]">
      <div id="workspace-code-panel" role="tabpanel" aria-label="Code editor" aria-labelledby="workspace-code-tab" className={`${tab === "result" ? "hidden md:block" : "block"} min-w-0`}>
        <JavaScriptEditor value={code} onChange={setCode} modelPath="lesson-example/main.js" />
        <label htmlFor="workspace-stdin" className="mt-5 block text-sm font-semibold">Input teks untuk variabel <code>input</code></label>
        <textarea id="workspace-stdin" value={stdin} maxLength={4000} onChange={(event) => setStdin(event.target.value)} rows={2} className="mt-2 w-full rounded-md border border-input bg-background p-3 font-mono text-sm focus-visible:outline-2 focus-visible:outline-ring" placeholder="Opsional, misalnya: 2 3" />
        <label htmlFor="workspace-prediction" className="mt-5 block text-sm font-semibold">Menurutmu, apa outputnya?</label>
        <textarea id="workspace-prediction" value={prediction} maxLength={4000} onChange={(event) => setPrediction(event.target.value)} rows={2} className="mt-2 w-full rounded-md border border-input bg-background p-3 font-mono text-sm focus-visible:outline-2 focus-visible:outline-ring" placeholder="Tulis prediksi sebelum Run" />
        <Button type="button" className="mt-4" disabled={pending || !code.trim()} onClick={runCode}><Play size={15} aria-hidden="true" />{pending ? "Running…" : "Run"}</Button>
      </div>
      <div id="workspace-result-panel" role="tabpanel" aria-label="Run result" aria-labelledby="workspace-result-tab" className={`${tab === "code" ? "hidden md:block" : "block"} min-w-0`}>
        <OutputPanel result={result} error={runError} pending={pending} />
        {result?.status === "success" && predictionAtRun?.trim() && <div className="mt-4 border-y border-border py-4 text-sm" aria-live="polite"><h3 className="font-semibold">Prediction check</h3><div className="mt-3 grid gap-4 sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your prediction</p><pre className="mt-1 whitespace-pre-wrap font-mono">{predictionAtRun}</pre></div><div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actual output</p><pre className="mt-1 whitespace-pre-wrap font-mono">{result.stdout || "(empty)"}</pre></div></div><p className="mt-3 text-muted-foreground">{normalizeOutput(predictionAtRun) === normalizeOutput(result.stdout) ? "Your prediction matches." : "Compare the current values to find the step that changed the result."}</p></div>}
        {result?.status === "success" && <div className="mt-4"><Button type="button" variant="outline" onClick={() => setShowTrace(!showTrace)}>{showTrace ? "Hide execution trace" : (predictionAtRun ?? "").trim() && normalizeOutput(predictionAtRun ?? "") !== normalizeOutput(result.stdout) ? "See why" : "Visualize execution"}</Button>{showTrace && <ExecutionVisualizer trace={result.trace} />}</div>}
      </div>
    </div>
  </section>;
}
