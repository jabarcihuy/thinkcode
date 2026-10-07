"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGuestLearning } from "./guest-mode";
import { DashboardView } from "@/features/learning/components/dashboard-view";
import { LearningPathView } from "@/features/learning/components/learning-path-view";
import { LabListView } from "@/features/learning/components/lab-list-view";
import { nextLearningAction } from "@/features/learning/domain/next-action";
import { SqlabPageView } from "@/features/sqlab/components/sqlab-page-view";
import { LazySqlabWorkspace } from "@/features/sqlab/components/lazy-sqlab-workspace";
import { ChatbotPageView } from "@/features/ai/components/chatbot-page-view";
import { AssessmentResultView } from "@/features/assessment/components/assessment-result-view";
import { CourseTestView } from "@/features/assessment/components/course-test-view";
import { startGuestTest } from "../server/actions";
import { GuestProfile } from "./profile";
export function GuestLearningPages({ view, userId, activeTest }: { view: string; userId: string; activeTest: string | null }) {
 const local = useGuestLearning();
 const overview = local?.overview ?? null;
 const post = local?.catalog.tests.find((test) => test.type === "FINAL");
 const pre = local?.catalog.tests.find((test) => test.type === "PRETEST");
 const postPassed = Boolean(post && local?.value.tests[post.id]?.passed);
 const postAvailable = Boolean(overview?.baselineComplete && overview.metrics.completedRequiredLessons === overview.metrics.totalRequiredLessons);
 if (local?.status === "loading") return <main id="main-content" className="mx-auto max-w-6xl px-5 py-8"><p role="status">Menyiapkan progres belajar…</p></main>;
 if (view === "profile") return <GuestProfile />;
 if (view === "sqlab") return <SqlabPageView dashboardHref="/guest"><LazySqlabWorkspace userId={userId} /></SqlabPageView>;
 if (view === "chatbot") return <ChatbotPageView overview={overview} guest />;
 if (view === "materials" && overview) return <LearningPathView overview={overview} authenticated guest />;
 if (view === "lab") return <LabListView overview={overview} guest />;
 if (view === "pre-result" || view === "post-result") {
  const test = view === "pre-result" ? pre : post;
  const result = test ? local?.value.tests[test.id] : undefined;
  if (test && result) return <AssessmentResultView guest result={{ title: test.title, type: test.type, score: result.score, passingScore: test.passing_score }} topicSummary={result.topicSummary ?? []} />;
 }
 if (view === "tests" || view === "post-test") {
  const diagnostic = view === "tests";
  const test = diagnostic ? pre : post;
  const result = test ? local?.value.tests[test.id] : undefined;
  const available = diagnostic || postAvailable;
  const active = Boolean(test && activeTest === test.id);
  const label = active ? "Lanjutkan tes" : result ? diagnostic ? "Ulangi tes awal" : "Ulangi tes akhir" : diagnostic ? "Mulai tes awal" : "Mulai tes akhir";
  const action = test && (available || active) ? active ? <Button asChild className="mt-5"><Link href={`/guest/tests/${test.id}`}>{label}</Link></Button> : <form action={startGuestTest} className="mt-5"><input type="hidden" name="testId" value={test.id} /><Button type="submit">{label}</Button></form> : null;
  return <CourseTestView diagnostic={diagnostic} overview={overview} title={test?.title} result={result ? { latestScore: result.score, highestScore: result.highestScore ?? result.score, passed: result.passed } : undefined} resultHref={result ? `/guest?view=${diagnostic ? "pre-result" : "post-result"}` : undefined} baselineScore={pre ? local?.value.tests[pre.id]?.score : undefined} available={available} active={active} studied={Boolean(overview?.lessons.some((lesson) => lesson.readAt))} startAction={action} guest />;
 }
 const action = overview ? nextLearningAction(overview, null, postPassed) : null;
 const activeAction = activeTest ? { href: `/guest/tests/${activeTest}`, title: "Lanjutkan tes", label: "Lanjutkan tes", description: "Selesaikan sesi yang masih aktif. Jawaban tersimpan di perangkat ini." } : action;
 return <DashboardView displayName={local?.name ?? ""} overview={overview} action={activeAction} postPassed={postPassed} postAvailable={postAvailable} guest />;
}
