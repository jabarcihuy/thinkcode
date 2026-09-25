import type { Metadata } from "next";
import Link from "next/link";
import { Check, LockKeyhole } from "lucide-react";
import { requireAccount } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { StartAssessmentButton } from "@/features/assessment/components/start-assessment-button";
import { getAssessmentSummaries } from "@/features/assessment/data/assessment-repository";
import { DEFAULT_LEARNING_PATH_SLUG, learningPathHref } from "@/features/learning/config";

export const metadata: Metadata = { title: "Checkpoints & Assessment" };

export default async function AssessmentsPage() {
  const { userId } = await requireAccount();
  const assessments = await getAssessmentSummaries(DEFAULT_LEARNING_PATH_SLUG, userId);
  const courseCompleted = assessments.length > 0 && assessments.every((assessment) => assessment.result?.passed === true);

  return <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
    <Link className="text-sm font-medium text-primary hover:underline" href={learningPathHref(DEFAULT_LEARNING_PATH_SLUG)}>Kembali ke learning path</Link>
    <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Checkpoints & Assessment</h1>
    <p className="mt-3 max-w-[72ch] leading-7 text-muted-foreground">Tunjukkan pemahaman setelah setiap kelompok chapter. Run lokal tersedia; AI Tutor, petunjuk, dan solusi dinonaktifkan selama assessment.</p>
    {courseCompleted && <p className="mt-8 rounded-md bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground">Learning path selesai. Seluruh checkpoint dan final assessment lulus.</p>}
    {assessments.length === 0 ? <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">Assessment belum tersedia.</p> : <ol className="mt-9 border-t border-border">
      {assessments.map((assessment) => <li key={assessment.id} className="border-b border-border py-6 sm:py-7">
        <div className="flex items-start gap-4">
          <span className="mt-0.5 text-primary" aria-hidden="true">{assessment.result?.passed ? <Check size={19} /> : !assessment.available ? <LockKeyhole size={19} /> : null}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{assessment.type === "FINAL" ? "Final assessment" : `Checkpoint · Setelah Chapter ${assessment.gateAfterChapter}`}</p>
            <h2 className="mt-1 text-lg font-semibold">{assessment.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{assessment.instructions}</p>
            {assessment.result && <p className="mt-3 text-sm tabular-nums">Terbaru {assessment.result.latestScore}/100 · Tertinggi {assessment.result.highestScore}/100 · {assessment.result.attemptCount} percobaan</p>}
            {assessment.available
              ? <StartAssessmentButton slug={assessment.slug} activeSessionId={assessment.activeSessionId} label={assessment.result ? "Coba lagi" : "Mulai assessment"} />
              : <p className="mt-4 text-sm text-muted-foreground">Selesaikan lesson wajib dan assessment sebelumnya untuk membuka bagian ini.</p>}
          </div>
        </div>
      </li>)}
    </ol>}
    <section className="mt-10 border-t border-border pt-6">
      <h2 className="text-base font-semibold">Aturan mode</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Skor minimum {assessments[0]?.passingScore ?? 75}/100. Percobaan dapat diulang setelah sesi sebelumnya dikirim. Nilai dihitung dan disimpan di server.</p>
      <Button asChild variant="outline" className="mt-4"><Link href={learningPathHref(DEFAULT_LEARNING_PATH_SLUG)}>Buka learning path</Link></Button>
    </section>
  </main>;
}
