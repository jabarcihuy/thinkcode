import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentAccount } from "@/lib/auth/session";
import { LearningHeader } from "@/features/learning/components/learning-header";
import { LessonList } from "@/features/learning/components/lesson-list";
import { getLearningOverview } from "@/features/learning/data/learning-repository";
import { chapterIdSchema, pathSlugSchema } from "@/features/learning/validation/routes";

export default async function ChapterPage({ params }: { params: Promise<{ pathSlug: string; chapterId: string }> }) {
  const { pathSlug, chapterId } = await params;
  if (!pathSlugSchema.safeParse(pathSlug).success || !chapterIdSchema.safeParse(chapterId).success) notFound();
  const account = await getCurrentAccount();
  const overview = await getLearningOverview(pathSlug, account?.userId ?? null);
  const chapter = overview?.chapters.find((item) => item.id === chapterId);
  if (!overview || !chapter) notFound();
  const lessons = overview.lessons.filter((lesson) => lesson.chapter_id === chapter.id);

  return <div className="min-h-screen"><LearningHeader account={account} />
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link className="hover:text-primary" href={`/learn/${pathSlug}`}>{overview.path.title}</Link><span aria-hidden="true" className="px-2">/</span>Chapter {chapter.position}</nav>
      <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">{chapter.title}</h1>
      <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">{chapter.description}</p>
      <div className="mt-12"><h2 className="mb-5 text-lg font-semibold">Lesson dalam chapter ini</h2><LessonList lessons={lessons} pathSlug={pathSlug} authenticated={Boolean(account)} /></div>
      <Link className="mt-10 inline-block text-sm font-semibold text-primary underline underline-offset-4" href={`/learn/${pathSlug}`}>Kembali ke jalur belajar</Link>
    </main>
  </div>;
}
