import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentAccount } from "@/lib/auth/session";
import { LearningHeader } from "@/features/learning/components/learning-header";
import { LessonContent } from "@/features/learning/components/lesson-content";
import { LessonOutline } from "@/features/learning/components/lesson-outline";
import { LessonStateLabel } from "@/features/learning/components/lesson-state";
import { getLearningOverview, getLessonMaterial } from "@/features/learning/data/learning-repository";
import { DatasetLabSwitcher } from "@/features/database/components/dataset-lab-switcher";
import { lessonScenarios } from "@/features/database/domain/lesson-scenarios";
import { CampusDataPreview } from "@/features/database/components/campus-data-preview";
import { getLessonLabPrompt } from "@/features/database/domain/lesson-lab-guidance";
import { getPublicExercises } from "@/features/practice/data/exercise-repository";
import { ExerciseRenderer } from "@/features/practice/components/exercise-renderer";
import { resolveLessonRoute, mayOpenLesson } from "@/features/learning/domain/progression";
import { startLessonAction } from "@/features/learning/actions";
import { lessonHref } from "@/features/learning/config";
import { lessonSlugSchema, pathSlugSchema } from "@/features/learning/validation/routes";

export default async function LessonPage({ params }: { params: Promise<{ pathSlug: string; lessonSlug: string }> }) {
  const { pathSlug, lessonSlug } = await params;
  if (!pathSlugSchema.safeParse(pathSlug).success || !lessonSlugSchema.safeParse(lessonSlug).success) notFound();
  const account = await getCurrentAccount();
  const overview = await getLearningOverview(pathSlug, account?.userId ?? null);
  if (!overview) notFound();
  const lesson = resolveLessonRoute(overview.lessons, lessonSlug, Boolean(account));
  if (!lesson) notFound();
  const [material, exercises] = await Promise.all([
    getLessonMaterial(lesson.id),
    account ? getPublicExercises(lesson.id, account.userId) : Promise.resolve([]),
  ]);
  if (material === null) notFound();
  const chapter = overview.chapters.find((item) => item.id === lesson.chapter_id);
  if (!chapter) notFound();
  const index = overview.lessons.findIndex((item) => item.id === lesson.id);
  const previous = overview.lessons[index - 1] ?? null;
  const next = overview.lessons[index + 1] ?? null;
  const chapterLessons = overview.lessons.filter((item) => item.chapter_id === chapter.id);
  const isRelationMaterial = lessonSlug === "membaca-bentuk-data" || lessonSlug === "key-dan-hubungan-antar-tabel";
  const hasInteractiveContent = Boolean(material.exampleSql) || exercises.length > 0;

  return <div className="min-h-dvh"><LearningHeader account={account} />
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><Link className="hover:text-accent" href={`/learn/${pathSlug}`}>{overview.path.title}</Link><span aria-hidden="true">/</span><Link className="hover:text-accent" href={`/learn/${pathSlug}/chapters/${chapter.id}`}>{chapter.title}</Link></nav>
      <div className="mt-9 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
        <article className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{lesson.title}</h1>
          <p className="mt-3 max-w-[72ch] leading-7 text-muted-foreground">{lesson.summary}</p>
          {hasInteractiveContent && <div className="mt-6 lg:hidden">
            <details className="group rounded-md border border-border px-4 py-3">
            <summary className="min-h-8 cursor-pointer text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring">{material.exampleSql ? "Daftar isi lab dan latihan" : "Daftar isi materi dan latihan"}</summary>
              <div className="pt-3">
                <LessonOutline hasLab={Boolean(material.exampleSql)} exercises={exercises.map(({ id, title }) => ({ id, title }))} />
              </div>
            </details>
          </div>}
          <div className="mt-5">{account ? <LessonStateLabel state={lesson.state} /> : <span className="text-sm font-medium text-accent">Pratinjau lesson</span>}</div>
          <div className="mt-10 border-t border-border pt-8"><LessonContent content={material.content} /></div>
          {isRelationMaterial && <CampusDataPreview />}
          {material.exampleSql && <DatasetLabSwitcher
            key={lesson.id}
            scenarios={lessonScenarios(lessonSlug, { title: `Praktik: ${lesson.title}`, prompt: getLessonLabPrompt(material.exampleSql, lessonSlug), sql: material.exampleSql })}
            lessonId={account ? lesson.id : undefined}
          />}
          {account && <section id="lesson-practice" aria-label="Latihan per submateri" className="mt-12 scroll-mt-24"><div className="border-t border-border pt-8"><h2 className="text-2xl font-semibold tracking-tight">Latihan per submateri</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Coba latihan eksplorasi dan konteks lain, lalu tuntaskan practice wajib untuk membuka materi berikutnya. Latihan opsional tidak menghambat progres.</p></div>{exercises.length ? exercises.map((exercise) => <ExerciseRenderer key={exercise.id} exercise={exercise} pathSlug={pathSlug} />) : <p className="mt-6 text-sm text-muted-foreground">Latihan sedang disiapkan.</p>}</section>}
          <section aria-label="Aksi lesson" className="mt-12 border-t border-border pt-8">
            {account && lesson.state === "AVAILABLE" && <form action={startLessonAction.bind(null, pathSlug, lesson.id)}><Button type="submit">Mulai lesson</Button></form>}
            {account && lesson.state === "IN_PROGRESS" && <p className="text-sm text-muted-foreground">Selesaikan latihan wajib di atas untuk menuntaskan materi.</p>}
            {account && lesson.state === "COMPLETED" && <p className="text-sm font-medium text-accent">Lesson selesai. Kamu dapat melanjutkan ke lesson berikutnya.</p>}
            {!account && <><p className="text-sm text-muted-foreground">Masuk untuk mengikuti lesson dan menyimpan progres.</p><Button asChild className="mt-4"><Link href="/register">Buat akun</Link></Button></>}
          </section>
          <nav aria-label="Navigasi lesson" className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:justify-between">
            <div>{previous && mayOpenLesson(previous, Boolean(account)) && <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent hover:underline" href={lessonHref(pathSlug, previous.slug)}><ArrowLeft size={16} aria-hidden="true" />{previous.title}</Link>}</div>
            <div>{next && (mayOpenLesson(next, Boolean(account))
              ? <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent hover:underline" href={lessonHref(pathSlug, next.slug)}>{next.title}<ArrowRight size={16} aria-hidden="true" /></Link>
              : <span className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"><LockKeyhole size={16} aria-hidden="true" />Berikutnya: {next.title}</span>)}</div>
          </nav>
        </article>
        <aside aria-label="Navigasi lesson" className="border-t border-border pt-6 lg:sticky lg:top-8 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
          <div className="hidden lg:block">
            <LessonOutline hasLab={Boolean(material.exampleSql)} exercises={exercises.map(({ id, title }) => ({ id, title }))} />
          </div>
          <div className="mt-8 border-t border-border pt-6">
            <h2 className="text-sm font-semibold">{chapter.title}</h2>
            <ol className="mt-4 space-y-1">{chapterLessons.map((item) => <li key={item.id}>{mayOpenLesson(item, Boolean(account))
            ? <Link aria-current={item.id === lesson.id ? "page" : undefined} className={`block rounded-md px-3 py-2 text-sm hover:bg-muted ${item.id === lesson.id ? "bg-secondary font-semibold text-secondary-foreground" : "text-muted-foreground"}`} href={lessonHref(pathSlug, item.slug)}>{item.title}</Link>
            : <span className="block px-3 py-2 text-sm text-muted-foreground">{item.title}</span>}</li>)}</ol>
          </div>
        </aside>
      </div>
    </main>
  </div>;
}
