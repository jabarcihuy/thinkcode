import Link from "next/link";
import { ArrowRight, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_LEARNING_PATH_SLUG, learningPathHref } from "@/features/learning/config";
import { topicReviewHref } from "@/features/assessment/domain/topic-review";
import { summarizeTopics } from "@/features/assessment/domain/test-policy";
import { guestHref } from "@/features/guest/domain/links";
export function AssessmentResultView({ result, topicSummary, guest = false }: { result: { title: string; type: string; score: number; passingScore: number }; topicSummary: { topic: string; passed: boolean }[]; guest?: boolean }) {
 const diagnostic = result.type === "PRETEST";
 const passed = !diagnostic && result.score >= result.passingScore;
 const groupedTopics = summarizeTopics(topicSummary);
 const href = (value: string) => guest ? guestHref(value) : value;
  return <main id="main-content" className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
    <div className="border-b border-border pb-7">
      <h1 className="text-3xl font-semibold tracking-tight">{result.title}</h1>{guest && <p className="mt-3 text-sm text-muted-foreground">Hasil tersimpan di perangkat ini, bukan nilai resmi.</p>}
      <div className="mt-3 flex items-center gap-2 text-sm font-medium text-accent">{passed && <Check size={17} aria-hidden="true" />}{diagnostic ? "Pemahaman awal tercatat" : passed ? "Lulus" : "Belum lulus"}</div>
      <p className="mt-4 text-5xl font-semibold tabular-nums">{result.score}<span className="text-2xl text-muted-foreground">/100</span></p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{diagnostic ? "Tidak ada syarat lulus. Gunakan ringkasan ini untuk mengenali konsep yang perlu dipelajari." : `Batas kelulusan ${result.passingScore}. Jawaban diperiksa di server.`}</p>
    </div>
    {topicSummary.length > 0 && <section className="mt-8" aria-labelledby="topic-results"><h2 id="topic-results" className="text-lg font-semibold">Ringkasan topik</h2><ul className="mt-4 divide-y divide-border border-y border-border">{groupedTopics.map((item) => <li key={item.topic} className="flex items-center justify-between gap-4 py-3 text-sm"><div className="min-w-0"><span>{item.topic}</span>{item.correct < item.total && <Link href={href(topicReviewHref(item.topic, diagnostic))} className="mt-1 flex min-h-11 items-center font-medium text-primary underline underline-offset-4">{diagnostic ? "Lihat materi terkait" : "Pelajari kembali topik ini"}</Link>}</div><span className={item.correct === item.total ? "font-medium text-accent" : "text-muted-foreground"}>{item.correct}/{item.total} benar</span></li>)}</ul></section>}
    <div className="mt-8 flex flex-wrap gap-3"><Button asChild><Link href={href(diagnostic ? learningPathHref(DEFAULT_LEARNING_PATH_SLUG) : "/post-test")}>{diagnostic ? "Mulai membaca materi" : passed ? "Lihat post-test" : "Coba post-test lagi"}{diagnostic || passed ? <ArrowRight size={16} aria-hidden="true" /> : <RotateCcw size={16} aria-hidden="true" />}</Link></Button><Button asChild variant="outline"><Link href={href("/lab")}>Buka Lab Materi</Link></Button></div>
  </main>;
}
