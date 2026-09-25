import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireAccount } from "@/lib/auth/session";
import { getAssessmentResult } from "@/features/assessment/data/assessment-repository";
import { DEFAULT_LEARNING_PATH_SLUG, learningPathHref } from "@/features/learning/config";
import type { Json } from "@/types/database";

function feedbackObject(value: Json): Record<string, Json | undefined> {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export default async function AssessmentResultPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { userId } = await requireAccount();
  const { sessionId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) notFound();
  const result = await getAssessmentResult(sessionId, userId);
  if (!result) notFound();
  const safe = feedbackObject(result.safeFeedback);
  const topicSummary = Array.isArray(safe.topicSummary) ? safe.topicSummary.filter((item): item is { topic: string; passed: boolean } =>
    Boolean(item && typeof item === "object" && !Array.isArray(item) && typeof item.topic === "string" && typeof item.passed === "boolean")) : [];
  const passed = result.score >= result.passingScore;
  return <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
    <div className="border-b border-border pb-7">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">{passed && <Check size={17} aria-hidden="true" />}{passed ? "Lulus" : "Belum lulus"}</div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">{result.title}</h1>
      <p className="mt-4 text-5xl font-semibold tabular-nums">{result.score}<span className="text-2xl text-muted-foreground">/100</span></p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">Batas kelulusan {result.passingScore}. Jawaban diperiksa di server; detail test tersembunyi tetap privat.</p>
    </div>
    {topicSummary.length > 0 && <section className="mt-8" aria-labelledby="topic-results"><h2 id="topic-results" className="text-lg font-semibold">Ringkasan topik</h2><ul className="mt-4 divide-y divide-border border-y border-border">{topicSummary.map((item) => <li key={item.topic} className="flex items-center justify-between gap-4 py-3 text-sm"><span>{item.topic}</span><span className={item.passed ? "font-medium text-primary" : "text-muted-foreground"}>{item.passed ? "Kuat" : "Perlu ditinjau"}</span></li>)}</ul></section>}
    <div className="mt-8 flex flex-wrap gap-3"><Button asChild><Link href="/assessments">{passed ? "Lihat assessment berikutnya" : "Coba assessment lagi"}<RotateCcw size={16} aria-hidden="true" /></Link></Button><Button asChild variant="outline"><Link href={learningPathHref(DEFAULT_LEARNING_PATH_SLUG)}>Kembali belajar</Link></Button></div>
  </main>;
}
