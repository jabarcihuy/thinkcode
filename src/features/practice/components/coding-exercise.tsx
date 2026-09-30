"use client";

import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CodeRunResult } from "@/lib/providers/code-runner";
import type { PublicExercise } from "@/features/practice/types";
import { useExerciseCheck } from "@/features/practice/components/use-exercise-check";
import { exerciseTypeLabel } from "@/features/practice/domain/exercise-labels";
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
  const checkState = useExerciseCheck(exercise.id, pathSlug);

  async function run() {
    if (running) return;
    setLastAction("run"); setRunning(true); setRunError(null); setRunResult(null);
    try {
      setRunResult(await runner.run({ language: "javascript", sourceCode: code, stdin, visualize: true }));
    } catch { setRunError("Sandbox gagal dibuka. Coba lagi."); }
    finally { setRunning(false); }
  }

  async function check() {
    if (running || checkState.pending) return;
    setLastAction("check");
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

  return <section id={`practice-${exercise.id}`} aria-label={exercise.title} className="scroll-mt-24 border-t border-border py-8">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-xl font-semibold tracking-tight">{exercise.type === "DEBUGGING" ? `Bug Lab: ${exercise.title}` : exercise.title}</h3><p className="mt-1.5 text-xs text-muted-foreground">{exerciseTypeLabel(exercise.type)}{exercise.isRequired ? " · Wajib" : " · Opsional"}</p></div>{exercise.passed && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">Lulus</span>}</div>
    <div className="mt-5 space-y-8">
      <section aria-label="Soal latihan">
        <p className="leading-7 text-muted-foreground">{exercise.prompt}</p>
        {exercise.visibleTests.length > 0 && <div className="mt-6 border-t border-border pt-5"><h4 className="text-sm font-semibold">Contoh test</h4><ul className="mt-3 space-y-3">{exercise.visibleTests.map((test) => <li key={test.id} className="rounded-md bg-muted p-3 font-mono text-xs"><p>Input: {test.stdin || "(kosong)"}</p><p className="mt-1">Output: {test.expectedOutput || "(kosong)"}</p></li>)}</ul></div>}
      </section>
      <section aria-label="Editor kode" className="border-t border-border pt-6">
        <JavaScriptEditor value={code} onChange={setCode} modelPath={`practice-${exercise.id}/main.js`} />
        <label htmlFor={`stdin-${exercise.id}`} className="mt-4 block text-sm font-semibold">Input teks untuk <code>input</code> saat Run</label>
        <textarea id={`stdin-${exercise.id}`} value={stdin} onChange={(event) => setStdin(event.target.value)} maxLength={4000} rows={2} className="mt-2 w-full rounded-md border border-input bg-background p-3 font-mono text-sm focus-visible:outline-2 focus-visible:outline-ring" />
        <div className="mt-4 flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={running || checkState.pending} onClick={run}><Play size={15} aria-hidden="true" />Run</Button><Button type="button" disabled={running || checkState.pending || !code.trim()} onClick={check}>Periksa jawaban</Button><Button type="button" variant="outline" onClick={() => { setCode(exercise.starterCode ?? ""); setRunResult(null); setRunError(null); }}><RotateCcw size={15} aria-hidden="true" />Atur ulang</Button></div>
        <p className="mt-3 text-xs text-muted-foreground">Run memakai input di atas tanpa menyimpan progres. Periksa jawaban menjalankan test terlihat di browser dan menyimpan percobaan.</p>
      </section>
      <section aria-label="Hasil dan feedback" className="border-t border-border pt-6">
        {lastAction === "run" ? <><OutputPanel result={runResult} error={runError} pending={running} />{runResult?.status === "success" && <ExecutionVisualizer trace={runResult.trace} />}</> : running ? <p role="status" className="rounded-lg border border-border bg-muted p-5 text-sm">Menjalankan test di browser…</p> : runError ? <p role="alert" className="rounded-lg border border-border p-5 text-sm text-destructive">{runError}</p> : <PracticeFeedback {...checkState} />}
      </section>
    </div>
    <TutorPanel lessonId={exercise.lessonId} exerciseId={exercise.id} sourceCode={code}
      visibleOutput={runResult?.stdout ?? ""}
      visibleTestResults={checkState.result?.visibleTests.map((test) => ({ position: test.position, passed: test.passed })) ?? []}
      />
  </section>;
}
