import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentAccount } from "@/lib/auth/session";
import { LearningHeader } from "@/features/learning/components/learning-header";
import { LessonContent } from "@/features/learning/components/lesson-content";
import { LessonStateLabel } from "@/features/learning/components/lesson-state";
import { getLearningOverview, getLessonMaterial } from "@/features/learning/data/learning-repository";
import { JavaScriptWorkspace } from "@/features/workspace/components/javascript-workspace";
import { getPublicExercises } from "@/features/practice/data/exercise-repository";
import { ExerciseRenderer } from "@/features/practice/components/exercise-renderer";
import { resolveLessonRoute, mayOpenLesson } from "@/features/learning/domain/progression";
import { startLessonAction } from "@/features/learning/actions";
import { lessonHref } from "@/features/learning/config";
import { lessonSlugSchema, pathSlugSchema } from "@/features/learning/validation/routes";
import { TutorPanel } from "@/features/ai/components/tutor-panel";

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

  return <div className="min-h-screen"><LearningHeader account={account} />
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><Link className="hover:text-primary" href={`/learn/${pathSlug}`}>{overview.path.title}</Link><span aria-hidden="true">/</span><Link className="hover:text-primary" href={`/learn/${pathSlug}/chapters/${chapter.id}`}>{chapter.title}</Link></nav>
      <div className="mt-9 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
        <article className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{lesson.title}</h1>
          <p className="mt-3 max-w-[72ch] leading-7 text-muted-foreground">{lesson.summary}</p>
          <div className="mt-5">{account ? <LessonStateLabel state={lesson.state} /> : <span className="text-sm font-medium text-primary">Lesson preview</span>}</div>
          <div className="mt-10 border-t border-border pt-8"><LessonContent content={material.content} /></div>
          {account && material.exampleSourceCode && <JavaScriptWorkspace starterCode={material.exampleSourceCode} />}
          {account && exercises.length === 0 && <TutorPanel lessonId={lesson.id} />}
          {account && <section aria-label="Practice" className="mt-12"><div className="border-t border-border pt-8"><p className="text-xs font-semibold uppercase tracking-wide text-primary">Practice</p><h2 className="mt-2 text-2xl font-bold tracking-tight">Terapkan yang baru dipelajari</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Selesaikan semua practice wajib untuk membuka lesson berikutnya. Kamu dapat mencoba lagi sebanyak yang diperlukan.</p></div>{exercises.length ? exercises.map((exercise) => <ExerciseRenderer key={exercise.id} exercise={exercise} pathSlug={pathSlug} />) : <p className="mt-6 text-sm text-muted-foreground">Practice sedang disiapkan.</p>}</section>}
          <section aria-label="Aksi lesson" className="mt-12 border-t border-border pt-8">
            {account && lesson.state === "AVAILABLE" && <form action={startLessonAction.bind(null, pathSlug, lesson.id)}><Button type="submit">Mulai lesson</Button></form>}
            {account && lesson.state === "IN_PROGRESS" && <p className="text-sm text-muted-foreground">Lanjutkan practice wajib di atas untuk menyelesaikan lesson.</p>}
            {account && lesson.state === "COMPLETED" && <p className="text-sm font-medium text-primary">Lesson selesai. Kamu dapat melanjutkan ke lesson berikutnya.</p>}
            {!account && <><p className="text-sm text-muted-foreground">Masuk untuk mengikuti lesson dan menyimpan progres.</p><Button asChild className="mt-4"><Link href="/register">Buat akun</Link></Button></>}
          </section>
          <nav aria-label="Navigasi lesson" className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:justify-between">
            <div>{previous && mayOpenLesson(previous, Boolean(account)) && <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline" href={lessonHref(pathSlug, previous.slug)}><ArrowLeft size={16} aria-hidden="true" />{previous.title}</Link>}</div>
            <div>{next && (mayOpenLesson(next, Boolean(account))
              ? <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline" href={lessonHref(pathSlug, next.slug)}>{next.title}<ArrowRight size={16} aria-hidden="true" /></Link>
              : <span className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"><LockKeyhole size={16} aria-hidden="true" />Berikutnya: {next.title}</span>)}</div>
          </nav>
        </article>
        <aside aria-label="Lesson chapter" className="border-t border-border pt-6 lg:sticky lg:top-8 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
          <h2 className="text-sm font-semibold">{chapter.title}</h2>
          <ol className="mt-4 space-y-1">{chapterLessons.map((item) => <li key={item.id}>{mayOpenLesson(item, Boolean(account))
            ? <Link aria-current={item.id === lesson.id ? "page" : undefined} className={`block rounded-md px-3 py-2 text-sm hover:bg-muted ${item.id === lesson.id ? "bg-secondary font-semibold text-secondary-foreground" : "text-muted-foreground"}`} href={lessonHref(pathSlug, item.slug)}>{item.title}</Link>
            : <span className="block px-3 py-2 text-sm text-muted-foreground">{item.title}</span>}</li>)}</ol>
        </aside>
      </div>
    </main>
  </div>;
}
