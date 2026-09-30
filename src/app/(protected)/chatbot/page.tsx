import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TutorPanel } from "@/features/ai/components/tutor-panel";
import { DEFAULT_LEARNING_PATH_SLUG, lessonHref, learningPathHref } from "@/features/learning/config";
import { getLearningOverview } from "@/features/learning/data/learning-repository";
import { requireAccount } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Chatbot" };

export default async function ChatbotPage() {
  const account = await requireAccount();
  const overview = await getLearningOverview(DEFAULT_LEARNING_PATH_SLUG, account.userId);
  const contextLesson = overview?.metrics.currentLesson
    ?? [...(overview?.lessons ?? [])].reverse().find((lesson) => lesson.state === "COMPLETED")
    ?? null;

  return <main id="main-content" className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
    <Link className="text-sm font-medium text-accent hover:underline" href="/dashboard">Dashboard</Link>
    <div className="mt-6 flex items-start gap-3">
      <MessageCircle size={21} className="mt-1 text-accent" aria-hidden="true" />
      <div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Chatbot</h1>
        <p className="mt-3 max-w-[68ch] leading-7 text-muted-foreground">Tanya konsep basis data dan dapatkan petunjuk sesuai materi yang sedang kamu pelajari.</p>
      </div>
    </div>

    {!overview || !contextLesson ? <section className="mt-9 border-y border-border py-6">
      <h2 className="text-lg font-semibold">Materi belum tersedia</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Mulai dari jalur belajar agar chatbot punya konteks yang tepat.</p>
      <Button asChild className="mt-4"><Link href={learningPathHref(DEFAULT_LEARNING_PATH_SLUG)}>Buka materi<ArrowRight size={16} aria-hidden="true" /></Link></Button>
    </section> : <>
      <section aria-label="Konteks lesson" className="mt-8 border-y border-border py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Konteks chatbot</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm"><span className="text-muted-foreground">{contextLesson.chapterTitle} · </span><span className="font-semibold">{contextLesson.title}</span></p>
          <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent hover:underline" href={lessonHref(overview.path.slug, contextLesson.slug)}>Buka lesson<ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </section>
      <TutorPanel key={contextLesson.id} lessonId={contextLesson.id} />
    </>}
  </main>;
}
