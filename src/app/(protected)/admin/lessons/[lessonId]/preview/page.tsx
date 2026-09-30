import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { getAdminLessonPreview } from "@/features/admin/server/lesson-preview";
import { LessonContent } from "@/features/learning/components/lesson-content";
import { LessonOutline } from "@/features/learning/components/lesson-outline";
import { CampusDataPreview } from "@/features/database/components/campus-data-preview";
import { DatasetLabSwitcher } from "@/features/database/components/dataset-lab-switcher";
import { lessonScenarios } from "@/features/database/domain/lesson-scenarios";
import { getLessonLabPrompt } from "@/features/database/domain/lesson-lab-guidance";
import { ExerciseRenderer } from "@/features/practice/components/exercise-renderer";

export const metadata: Metadata = { title: "Pratinjau materi · Admin", robots: { index: false, follow: false } };

export default async function AdminLessonPreviewPage({ params }: { params: Promise<{ lessonId: string }> }) {
  await requireRole("ADMIN");
  const { lessonId } = await params;
  const preview = await getAdminLessonPreview(lessonId);
  if (!preview) notFound();
  const { lesson, chapter, path, exercises, navigation } = preview;
  const hasLab = Boolean(lesson.example_sql);
  const isRelation = ["membaca-bentuk-data", "key-dan-hubungan-antar-tabel"].includes(lesson.slug);
  return <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
    <Link href="/admin" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline focus-visible:outline-2 focus-visible:outline-ring"><ArrowLeft size={16} aria-hidden="true" />Admin CMS</Link>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-border py-4">
      <p className="text-sm font-semibold">Pratinjau admin · {lesson.is_published ? "Terbit" : "Draft"}</p>
      <p className="text-xs leading-5 text-muted-foreground">Semua materi dapat ditinjau. Jawaban dan progres tidak disimpan.</p>
    </div>
    <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-14">
      <article className="min-w-0">
        <p className="text-sm text-muted-foreground">{path.title} / {chapter.title}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{lesson.title}</h1>
        <p className="mt-3 max-w-[72ch] leading-7 text-muted-foreground">{lesson.summary}</p>
        <div className="mt-6 lg:hidden"><details className="border-y border-border py-3"><summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring">Daftar isi pratinjau</summary><LessonOutline hasLab={hasLab} exercises={exercises.map(({ id, title }) => ({ id, title }))} /></details></div>
        <div className="mt-9 border-t border-border pt-8"><LessonContent content={lesson.content} /></div>
        {isRelation && <CampusDataPreview />}
        {lesson.example_sql && <DatasetLabSwitcher scenarios={lessonScenarios(lesson.slug, { title: `Praktik: ${lesson.title}`, sql: lesson.example_sql, prompt: getLessonLabPrompt(lesson.example_sql, lesson.slug) })} />}
        <section id="lesson-practice" className="mt-10 scroll-mt-24 border-t border-border pt-8" aria-label="Pratinjau latihan">
          <h2 className="text-2xl font-semibold tracking-tight">Latihan per submateri</h2>
          {exercises.length ? exercises.map((exercise) => <ExerciseRenderer key={exercise.id} exercise={exercise} pathSlug={path.slug} previewOnly />) : <p className="mt-4 text-sm text-muted-foreground">Belum ada latihan. Tambahkan melalui Admin CMS.</p>}
        </section>
      </article>
      <aside aria-label="Navigasi pratinjau" className="border-t border-border pt-6 lg:sticky lg:top-8 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
        <div className="hidden lg:block"><LessonOutline hasLab={hasLab} exercises={exercises.map(({ id, title }) => ({ id, title }))} /></div>
        <h2 className="mt-6 text-sm font-semibold">Materi dalam chapter</h2>
        <ul className="mt-3 space-y-1">{navigation.map((item) => <li key={item.id}><Link href={`/admin/lessons/${item.id}/preview`} aria-current={item.id === lesson.id ? "page" : undefined} className={`block min-h-11 rounded-md px-3 py-3 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring ${item.id === lesson.id ? "bg-secondary font-semibold" : "text-muted-foreground"}`}>{item.title}{!item.is_published && <span className="ml-2 text-xs">Draft</span>}</Link></li>)}</ul>
      </aside>
    </div>
  </main>;
}
