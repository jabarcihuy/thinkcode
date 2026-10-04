import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireAccount } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { LearningHeader } from "@/features/learning/components/learning-header";
import { LessonOutline } from "@/features/learning/components/lesson-outline";
import { LessonStateLabel } from "@/features/learning/components/lesson-state";
import { getAccessibleMaterial } from "@/features/learning/server/material-access";
import { DatasetLabSwitcher } from "@/features/database/components/dataset-lab-switcher";
import { CampusDataPreview } from "@/features/database/components/campus-data-preview";
import { lessonScenarios } from "@/features/database/domain/lesson-scenarios";
import { getLessonLabPrompt } from "@/features/database/domain/lesson-lab-guidance";
import { getPublicExercises } from "@/features/practice/data/exercise-repository";
import { ExerciseRenderer } from "@/features/practice/components/exercise-renderer";
import { startLessonAction } from "@/features/learning/actions";
import { lessonHref } from "@/features/learning/config";

export default async function PracticePage({ params }: { params: Promise<{ pathSlug: string; lessonSlug: string }> }) {
  const account = await requireAccount();
  const { pathSlug, lessonSlug } = await params;
  const access = await getAccessibleMaterial(pathSlug, lessonSlug);
  if (!access) notFound();
  const { lesson, material, index } = access;
  const supabase = await createClient();
  const { data: assessmentActive, error } = await supabase.rpc("current_user_has_active_assessment");
  if (error) throw error;
  const exercises = assessmentActive ? [] : await getPublicExercises(lesson.id, account.userId);
  const isRelation = ["membaca-bentuk-data", "key-dan-hubungan-antar-tabel"].includes(lessonSlug);
  const outline = <LessonOutline hasLab={Boolean(material.exampleSql)} hasDataExplorer={isRelation} exercises={exercises.map(({ id, title }) => ({ id, title }))} />;
  return <div className="min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0"><LearningHeader account={account} />
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <Link href={lessonHref(pathSlug, lessonSlug)} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline"><ArrowLeft size={16} aria-hidden="true" />Baca materi {index + 1}</Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Latihan · {lesson.title}</h1>
      <div className="mt-3"><LessonStateLabel state={lesson.state} /></div>
      {assessmentActive ? <section className="mt-8 border-t border-border pt-6"><h2 className="text-xl font-semibold">Assessment sedang berlangsung</h2><p className="mt-3 text-muted-foreground">Selesaikan atau tinggalkan assessment untuk melanjutkan latihan.</p><Button asChild className="mt-4"><Link href="/assessments">Kembali ke assessment</Link></Button></section> : <>
        <div className="mt-6 lg:hidden"><details className="rounded-md border border-border px-4 py-2"><summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold">Daftar isi latihan</summary>{outline}</details></div>
        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="min-w-0">
            {isRelation && <CampusDataPreview />}
            {lessonSlug === "key-dan-hubungan-antar-tabel" && <Button asChild variant="outline" className="mt-5"><Link href="/schema-builder">Coba menyusun skema sendiri</Link></Button>}
            {material.exampleSql && <DatasetLabSwitcher key={lesson.id} scenarios={lessonScenarios(lessonSlug, { title: `Praktik: ${lesson.title}`, prompt: getLessonLabPrompt(material.exampleSql, lessonSlug), sql: material.exampleSql })} lessonId={lesson.id} />}
            <section id="lesson-practice" aria-label="Latihan materi" className="mt-10 scroll-mt-24 border-t border-border pt-7"><h2 className="text-2xl font-semibold">Latihan materi {index + 1}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Selesaikan latihan wajib untuk membuka materi berikutnya. Latihan opsional tidak menghambat progres.</p>{exercises.length ? exercises.map((exercise) => <ExerciseRenderer key={exercise.id} exercise={exercise} pathSlug={pathSlug} />) : <p className="mt-6 text-muted-foreground">Latihan sedang disiapkan.</p>}</section>
            {lesson.state === "AVAILABLE" && <form className="mt-8" action={startLessonAction.bind(null, pathSlug, lesson.id)}><Button type="submit">Mulai latihan</Button></form>}
            {lesson.state === "COMPLETED" && <p role="status" className="mt-8 font-medium text-accent">Latihan wajib selesai. Materi berikutnya mengikuti urutan dan checkpoint belajar.</p>}
          </div>
          <aside aria-label="Daftar isi latihan" className="hidden border-l border-border pl-6 lg:sticky lg:top-8 lg:block">{outline}</aside>
        </div>
      </>}
    </main>
  </div>;
}
