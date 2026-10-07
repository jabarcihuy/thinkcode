import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CorePreparation } from "@/features/learning/components/core-preparation";
import { LessonOutline } from "@/features/learning/components/lesson-outline";
import { LessonStateLabel } from "@/features/learning/components/lesson-state";
import { LabExploration } from "@/features/learning/components/lab-exploration";
import { lessonScenarios } from "@/features/database/domain/lesson-scenarios";
import { getLessonLabPrompt } from "@/features/database/domain/lesson-lab-guidance";
import { ExerciseRenderer } from "@/features/practice/components/exercise-renderer";
import { TutorPanel } from "@/features/ai/components/tutor-panel";
import { lessonHref } from "@/features/learning/config";
import type { LearningOverview } from "../types";
import type { PublicExercise } from "@/features/practice/types";
import { guestHref } from "@/features/guest/domain/links";
export function MaterialLabView({ overview, index, exampleSql, exercises, userId, assessmentActive = false, guest = false }: { overview: LearningOverview; index: number; exampleSql: string | null; exercises: PublicExercise[]; userId: string; assessmentActive?: boolean; guest?: boolean }) {
 const lesson = overview.lessons[index]!;
 const lessonSlug = lesson.slug;
 const pathSlug = overview.path.slug;
 const material = { exampleSql };
 const href = (value: string) => guest ? guestHref(value) : value;
  const isRelation = ["membaca-bentuk-data", "key-dan-hubungan-antar-tabel"].includes(lessonSlug);
  const outline = <LessonOutline hasLab={Boolean(material.exampleSql)} hasDataExplorer={isRelation} exercises={exercises.map(({ id, title }) => ({ id, title }))} />;
  return (    <main id="main-content" className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <Link href={href(lessonHref(pathSlug, lessonSlug))} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline"><ArrowLeft size={16} aria-hidden="true" />Baca materi {index + 1}</Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Lab Materi · {lesson.title}</h1>
      <div className="mt-3"><LessonStateLabel state={lesson.state} /></div>
      {assessmentActive ? <section className="mt-8 border-t border-border pt-6"><h2 className="text-xl font-semibold">Assessment sedang berlangsung</h2><p className="mt-3 text-muted-foreground">Selesaikan tes yang sedang berlangsung untuk melanjutkan latihan.</p><Button asChild className="mt-4"><Link href="/assessments">Kembali ke assessment</Link></Button></section> : <>
        <div className="mt-5 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="min-w-0">
            {!lesson.readAt && <div className="mb-6 rounded-lg border border-border bg-white p-5"><h2 className="font-semibold">Baca materi terlebih dahulu</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Eksplorasi Lab boleh dicoba. Tandai Selesai dibaca sebelum memeriksa latihan inti.</p><Button asChild variant="outline" className="mt-4"><Link href={href(lessonHref(pathSlug, lessonSlug))}>Kembali membaca</Link></Button></div>}
            <LabExploration key={lesson.id} userId={userId} lessonId={lesson.id} scenarios={material.exampleSql ? lessonScenarios(lessonSlug, { title: lesson.title, prompt: getLessonLabPrompt(material.exampleSql, lessonSlug), sql: material.exampleSql }) : undefined} />
            <section id="lesson-practice" aria-label="Latihan materi" className="mt-5 scroll-mt-6 border-t border-border pt-5"><h2 className="text-2xl font-semibold">Latihan inti</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Lulus latihan inti untuk menuntaskan materi. Bebas mencoba lagi.</p><CorePreparation slug={lessonSlug} />{exercises.length ? exercises.map((exercise) => <ExerciseRenderer reviewHref={href(lessonHref(pathSlug, lessonSlug))} userId={userId} key={exercise.id} exercise={exercise} pathSlug={pathSlug} />) : <p className="mt-6 text-muted-foreground">Latihan sedang disiapkan.</p>}</section>
            {lesson.state === "COMPLETED" && <section className="mt-8 rounded-lg bg-secondary p-5"><h2 className="font-semibold">Materi tuntas</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Bacaan dan latihan inti sudah selesai. Lanjutkan saat kamu siap.</p><Button asChild className="mt-4 w-full sm:w-auto"><Link href={href(overview.lessons[index + 1] ? lessonHref(pathSlug, overview.lessons[index + 1]!.slug) : "/post-test")}>{overview.lessons[index + 1] ? "Baca materi berikutnya" : "Buka tes akhir"}</Link></Button></section>}
            {isRelation && <TutorPanel lessonId={lesson.id} />}
          </div>
          <aside aria-label="Daftar isi Lab" className="hidden border-l border-border pl-6 lg:sticky lg:top-8 lg:block">{outline}</aside>
        </div>
      </>}
    </main>);
}
