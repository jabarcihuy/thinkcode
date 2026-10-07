"use client";


import { useText } from "@/i18n/use-text";


import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, StepBack, StepForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExecutionTrace, TraceStep } from "@/lib/providers/code-runner";

export function clampTraceIndex(index: number, length: number): number { return Math.min(Math.max(index, 0), Math.max(0, length - 1)); }
export function nextTraceIndex(index: number, length: number): number { return clampTraceIndex(index + 1, length); }
export function previousTraceIndex(index: number, length: number): number { return clampTraceIndex(index - 1, length); }

function eventText(step: TraceStep): string {
  if (step.event === "condition") return `Kondisi ${step.condition ? "benar" : "salah"}`;
  if (step.event === "iteration") return `Iterasi ${step.iteration ?? ""}`;
  if (step.event === "function_call") return `Panggil ${step.function ?? "fungsi"}`;
  if (step.event === "return") return `Return ${step.output ?? ""}`;
  if (step.event === "array_access") return `Baca ${step.arrayAccess?.array ?? "array"}[${step.arrayAccess?.index ?? "?"}] → ${step.arrayAccess?.value ?? "undefined"}`;
  if (step.event === "output") return `Output ${step.output ?? ""}`;
  return "Nilai variabel";
}

function history(trace: ExecutionTrace, index: number, name: string): string[] {
  const values: string[] = [];
  for (const step of trace.steps.slice(0, index + 1)) {
    if (!(name in step.variables)) continue;
    const value = JSON.stringify(step.variables[name]);
    if (values.at(-1) !== value) values.push(value);
  }
  return values.slice(-8);
}

function adjacentValues(trace: ExecutionTrace, index: number, name: string) {
  let before: unknown;
  for (let cursor = index - 1; cursor >= 0; cursor--) {
    if (name in trace.steps[cursor]!.variables) { before = trace.steps[cursor]!.variables[name]; break; }
  }
  let after: unknown;
  for (let cursor = index + 1; cursor < trace.steps.length; cursor++) {
    if (name in trace.steps[cursor]!.variables && JSON.stringify(trace.steps[cursor]!.variables[name]) !== JSON.stringify(trace.steps[index]!.variables[name])) {
      after = trace.steps[cursor]!.variables[name]; break;
    }
  }
  return { before, current: trace.steps[index]!.variables[name], after };
}

export function ExecutionVisualizer({ trace }: { trace: ExecutionTrace }) {
  const tx = useText();

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setIndex((current) => {
      if (current >= trace.steps.length - 1) { setPlaying(false); return current; }
      return nextTraceIndex(current, trace.steps.length);
    }), 650);
    return () => window.clearInterval(timer);
  }, [playing, trace.steps.length]);
  if (trace.steps.length === 0) return <p className="text-sm text-muted-foreground">{tx("Belum ada langkah yang dapat divisualisasikan. Coba gunakan variabel, kondisi, loop, fungsi, atau output.")}</p>;
  const step = trace.steps[index];
  return <section aria-label={tx("Visualisasi eksekusi")} className="mt-5 border-t border-border pt-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-base font-semibold">{tx("Execution trace")}</h3><p role="progressbar" aria-label={tx("Progres trace")} aria-valuemin={1} aria-valuemax={trace.steps.length} aria-valuenow={index + 1} className="mt-1 text-xs text-muted-foreground">{tx("Langkah")}{" "}{index + 1} {" "}{tx("dari")}{" "}{trace.steps.length}{tx(trace.truncated ? " · Trace dibatasi 200 langkah" : "")}</p></div><div className="flex gap-1">
      <Button type="button" size="sm" className="h-10 w-10 px-0" variant="outline" aria-label={tx("Atur ulang visualisasi")} onClick={() => { setPlaying(false); setIndex(0); }}><RotateCcw size={15} /></Button>
      <Button type="button" size="sm" className="h-10 w-10 px-0" variant="outline" aria-label={tx("Langkah sebelumnya")} disabled={index === 0} onClick={() => { setPlaying(false); setIndex(previousTraceIndex(index, trace.steps.length)); }}><StepBack size={15} /></Button>
      <Button type="button" size="sm" className="h-10 w-10 px-0" variant="outline" aria-label={tx(playing ? "Jeda" : "Putar")} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={15} /> : <Play size={15} />}</Button>
      <Button type="button" size="sm" className="h-10 w-10 px-0" variant="outline" aria-label={tx("Langkah berikutnya")} disabled={index >= trace.steps.length - 1} onClick={() => { setPlaying(false); setIndex(nextTraceIndex(index, trace.steps.length)); }}><StepForward size={15} /></Button>
    </div></div>
    <div className="mt-4 rounded-md border border-border bg-muted px-4 py-3" aria-live="polite"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{tx("Baris")}{" "}{step.line || "output"}</p><p className="mt-1 font-semibold">{tx(eventText(step))}</p></div>
    {Object.keys(step.variables).length > 0 && <div className="mt-4 space-y-3"><h4 className="text-sm font-semibold">{tx("Apa yang berubah")}</h4>{Object.entries(step.variables).map(([name, value]) => { const adjacent = adjacentValues(trace, index, name); return <div key={name} className="border-b border-border pb-3 text-sm"><p className="font-mono font-semibold">{name}</p>{Array.isArray(value) ? <div className="mt-2 flex flex-wrap gap-2">{value.map((item, itemIndex) => <span key={itemIndex} className="rounded border border-border px-2 py-1 font-mono"><span className="text-muted-foreground">[{itemIndex}]</span> {String(item)}</span>)}</div> : <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-xs"><div><span className="block text-[10px] uppercase tracking-wide text-muted-foreground">{"Sebelum"}</span><span>{adjacent.before === undefined ? "-" : JSON.stringify(adjacent.before)}</span></div><div className="rounded bg-secondary px-2 py-1 text-secondary-foreground"><span className="block text-[10px] uppercase tracking-wide opacity-75">{"Sekarang"}</span><span>{JSON.stringify(adjacent.current)}</span></div><div><span className="block text-[10px] uppercase tracking-wide text-muted-foreground">{"Berikutnya"}</span><span>{adjacent.after === undefined ? "-" : JSON.stringify(adjacent.after)}</span></div></div>}<p className="sr-only">{tx("Riwayat nilai:")}{" "}{tx(history(trace, index, name).join(" lalu "))}</p></div>; })}</div>}
  </section>;
}
