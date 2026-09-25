"use client";

import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CodeRunResult } from "@/lib/providers/code-runner";
import type { PublicExercise } from "@/features/practice/types";
import { useExerciseCheck } from "@/features/practice/components/use-exercise-check";
import { PracticeFeedback } from "@/features/practice/components/practice-feedback";
import { JavaScriptEditor } from "@/features/workspace/components/javascript-editor";
import { OutputPanel } from "@/features/workspace/components/output-panel";
import { ExecutionVisualizer } from "@/features/workspace/components/execution-visualizer";
import { BrowserJavaScriptRunner } from "@/lib/providers/browser-javascript-runner";
import type { ClientTestResult } from "@/features/practice/types";
import { TutorPanel } from "@/features/ai/components/tutor-panel";

const runner = new BrowserJavaScriptRunner();

export function CodingExercise({ exercise, pathSlug }: { exercise: PublicExercise; pathSlug: string }) {
  const [code, setCode] = useState(exercise.starterCode ?? "// Tulis solusi JavaScript di sini\n");
  const [stdin, setStdin] = useState(exercise.visibleTests[0]?.stdin ?? "");
  const [runResult, setRunResult] = useState<CodeRunResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [lastAction, setLastAction] = useState<"run" | "check">("run");
  const [tab, setTab] = useState<"problem" | "code" | "result">("problem");
  const checkState = useExerciseCheck(exercise.id, pathSlug);

  async function run() {
    if (running) return;
    setLastAction("run"); setTab("result"); setRunning(true); setRunError(null); setRunResult(null);
    try {
      setRunResult(await runner.run({ language: "javascript", sourceCode: code, stdin, visualize: true }));
    } catch { setRunError("Sandbox gagal dibuka. Coba lagi."); }
    finally { setRunning(false); }
  }

  async function check() {
    if (running || checkState.pending) return;
    setLastAction("check"); setTab("result");
    setRunning(true);
    try {
      const runResults: ClientTestResult[] = [];
      for (const test of exercise.visibleTests) {
        const result = await runner.run({ language: "javascript", sourceCode: code, stdin: test.stdin });
        runResults.push({ position: test.position, status: result.status, stdout: result.stdout, stderr: result.stderr });
      }
      await checkState.check({ sourceCode: code, runResults });
    } catch { setRunError("Test lokal gagal dijalankan. Coba lagi."); }
    finally { setRunning(false); }
  }

  return <section aria-label={exercise.title} className="border-t border-border py-8">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-xl font-bold tracking-tight">{exercise.type === "DEBUGGING" ? `Bug Lab: ${exercise.title}` : exercise.title}</h3><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">{exercise.type.replaceAll("_", " ")}{exercise.isRequired ? " · Wajib" : " · Opsional"}</p></div>{exercise.passed && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">Lulus</span>}</div>
    <div role="tablist" aria-label={`Panel ${exercise.title}`} className="mt-5 flex gap-2 md:hidden">
      {(["problem", "code", "result"] as const).map((item) => <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={`min-h-11 rounded-md px-4 text-sm font-semibold capitalize ${tab === item ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{item}</button>)}
    </div>
    <div className="mt-5 grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
      <div className={tab === "problem" ? "block" : "hidden md:block"}>
        <p className="leading-7 text-muted-foreground">{exercise.prompt}</p>
        {exercise.visibleTests.length > 0 && <div className="mt-6 border-t border-border pt-5"><h4 className="text-sm font-semibold">Contoh test</h4><ul className="mt-3 space-y-3">{exercise.visibleTests.map((test) => <li key={test.id} className="rounded-md bg-muted p-3 font-mono text-xs"><p>Input: {test.stdin || "(kosong)"}</p><p className="mt-1">Output: {test.expectedOutput || "(kosong)"}</p></li>)}</ul></div>}
      </div>
      <div className={tab === "code" ? "block" : "hidden md:block"}>
        <JavaScriptEditor value={code} onChange={setCode} modelPath={`practice-${exercise.id}/main.js`} />
        <label htmlFor={`stdin-${exercise.id}`} className="mt-4 block text-sm font-semibold">Input teks untuk <code>input</code> saat Run</label>
        <textarea id={`stdin-${exercise.id}`} value={stdin} onChange={(event) => setStdin(event.target.value)} maxLength={4000} rows={2} className="mt-2 w-full rounded-md border border-input bg-background p-3 font-mono text-sm focus-visible:outline-2 focus-visible:outline-ring" />
        <div className="mt-4 flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={running || checkState.pending} onClick={run}><Play size={15} aria-hidden="true" />Run</Button><Button type="button" disabled={running || checkState.pending || !code.trim()} onClick={check}>Check Answer</Button><Button type="button" variant="outline" onClick={() => { setCode(exercise.starterCode ?? ""); setRunResult(null); setRunError(null); }}><RotateCcw size={15} aria-hidden="true" />Reset</Button></div>
        <p className="mt-3 text-xs text-muted-foreground">Run memakai input di atas tanpa menyimpan progres. Check menjalankan test terlihat di browser dan menyimpan percobaan.</p>
      </div>
      <div className={`md:col-start-2 ${tab === "result" ? "block" : "hidden md:block"}`}>{lastAction === "run" ? <><OutputPanel result={runResult} error={runError} pending={running} />{runResult?.status === "success" && <ExecutionVisualizer trace={runResult.trace} />}</> : running ? <p role="status" className="rounded-lg border border-border bg-muted p-5 text-sm">Menjalankan test di browser…</p> : runError ? <p role="alert" className="rounded-lg border border-border p-5 text-sm text-destructive">{runError}</p> : <PracticeFeedback {...checkState} />}</div>
    </div>
    <TutorPanel lessonId={exercise.lessonId} exerciseId={exercise.id} sourceCode={code}
      visibleOutput={runResult?.stdout ?? ""}
      visibleTestResults={checkState.result?.visibleTests.map((test) => ({ position: test.position, passed: test.passed })) ?? []}
      trace={runResult?.trace} />
  </section>;
}
