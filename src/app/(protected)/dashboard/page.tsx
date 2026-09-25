import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireAccount } from "@/lib/auth/session";
import { DEFAULT_LEARNING_PATH_SLUG, lessonHref, learningPathHref } from "@/features/learning/config";
import { ProgressSummary } from "@/features/learning/components/progress-summary";
import { getLearningOverview } from "@/features/learning/data/learning-repository";
import { getAssessmentSummaries } from "@/features/assessment/data/assessment-repository";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { userId, profile } = await requireAccount();
  const overview = await getLearningOverview(DEFAULT_LEARNING_PATH_SLUG, userId);
  const assessments = await getAssessmentSummaries(DEFAULT_LEARNING_PATH_SLUG, userId);
  const current = overview?.metrics.currentLesson;
  const hasStarted = overview?.lessons.some((lesson) => lesson.state === "IN_PROGRESS" || lesson.state === "COMPLETED") ?? false;
  const nextAssessment = assessments.find((assessment) => !assessment.result?.passed) ?? null;
  const pathUrl = learningPathHref(DEFAULT_LEARNING_PATH_SLUG);

  return <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
    <p className="text-sm font-semibold text-primary">YOUR LEARNING PATH</p>
    <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Welcome back{profile.display_name ? `, ${profile.display_name}` : ""}.</h1>
    <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Here is the next step in your programming logic journey.</p>
    {!overview ? <section className="mt-12 border-t border-border pt-8"><h2 className="text-xl font-semibold">Belum ada jalur belajar</h2><p className="mt-2 text-muted-foreground">Jalur belajar akan muncul setelah dipublikasikan.</p></section> : <div className="mt-12 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
      <section className="border-t border-border pt-8" aria-labelledby="continue-title">
        <h2 id="continue-title" className="text-2xl font-bold tracking-tight">{hasStarted ? "Continue Learning" : "Start Learning"}</h2>
        {current ? <>
          <p className="mt-3 text-sm font-semibold text-primary">{current.chapterTitle}</p>
          <h3 className="mt-2 text-xl font-semibold">{current.title}</h3>
          <p className="mt-3 max-w-xl leading-7 text-muted-foreground">{current.summary}</p>
          <Button asChild className="mt-6"><Link href={hasStarted ? lessonHref(overview.path.slug, current.slug) : pathUrl}>{hasStarted ? "Continue Learning" : "Start Learning"}<ArrowRight size={16} aria-hidden="true" /></Link></Button>
    </> : <><p className="mt-3 leading-7 text-muted-foreground">Finish the next checkpoint to unlock the following chapter group. Completed lessons remain available to review.</p><Button asChild variant="outline" className="mt-6"><Link href="/assessments">View checkpoints</Link></Button></>}
        <div className="mt-12 border-t border-border pt-7"><h2 className="text-lg font-semibold">{overview.path.title}</h2><p className="mt-2 max-w-xl leading-7 text-muted-foreground">{overview.path.description}</p><Link className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline" href={pathUrl}>Explore all chapters <ArrowRight size={16} aria-hidden="true" /></Link></div>
      </section>
      <aside className="space-y-7 border-t border-border pt-7 lg:sticky lg:top-8 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0" aria-label="Learning progress">
        <ProgressSummary metrics={overview.metrics} />
        <div className="border-t border-border pt-5"><p className="text-sm text-muted-foreground">Current chapter</p><p className="mt-1 font-semibold">{current?.chapterTitle ?? "All available lessons complete"}</p><p className="mt-2 text-sm text-muted-foreground">{overview.metrics.completedRequiredLessons} required lessons completed</p></div>
        <div className="border-t border-border pt-5"><div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold">Next checkpoint</h2><span className={`text-xs font-semibold ${nextAssessment?.available ? "text-primary" : "text-muted-foreground"}`}>{nextAssessment?.available ? "Available" : nextAssessment ? "Locked" : "Complete"}</span></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{nextAssessment?.title ?? "All checkpoints passed. Keep going toward course completion."}</p><Button asChild variant="outline" size="sm" className="mt-3"><Link href="/assessments">{nextAssessment?.available ? "Start checkpoint" : "View assessment status"}<ArrowRight size={14} aria-hidden="true" /></Link></Button></div>
      </aside>
    </div>}
  </main>;
}
