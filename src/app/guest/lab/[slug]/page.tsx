import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireGuest } from "@/features/guest/server/session";
import { guestMaterial, guestExercises } from "@/features/guest/server/catalog";
import { LabExploration } from "@/features/learning/components/lab-exploration";
import { ExerciseRenderer } from "@/features/practice/components/exercise-renderer";
import { TutorPanel } from "@/features/ai/components/tutor-panel";
import { CorePreparation } from "@/features/learning/components/core-preparation";
import { lessonScenarios } from "@/features/database/domain/lesson-scenarios";
import { getLessonLabPrompt } from "@/features/database/domain/lesson-lab-guidance";
export default async function GuestLabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const guest = await requireGuest();
  if (guest.activeTest) redirect(`/guest/tests/${guest.activeTest}`);
  const { slug } = await params;
  const lesson = await guestMaterial(slug);
  if (!lesson) notFound();
  const exercises = await guestExercises(lesson.id);
  return (
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <Link
        href={`/guest/materials/${slug}`}
        className="inline-flex min-h-11 items-center text-sm text-primary"
      >
        ← Baca materi
      </Link>
      <p className="mt-4 text-sm text-muted-foreground">
        Mode tamu · jawaban tidak disimpan
      </p>
      <h1 className="mt-3 text-2xl font-semibold">
        Lab Materi · {lesson.title}
      </h1>
      <LabExploration key={lesson.id} userId={guest.id} lessonId={lesson.id} scenarios={lesson.exampleSql ? lessonScenarios(slug, { title: lesson.title, prompt: getLessonLabPrompt(lesson.exampleSql, slug), sql: lesson.exampleSql }) : undefined} />
      <section id="lesson-practice" className="mt-5 scroll-mt-6 border-t border-border pt-5">
        <h2 className="text-2xl font-semibold">Latihan inti</h2>
        <CorePreparation slug={slug} />
        {exercises.map((exercise) => (
          <ExerciseRenderer
            key={exercise.id}
            exercise={exercise}
            pathSlug="database-fundamentals"
            userId={guest.id}
            reviewHref={`/guest/materials/${slug}`}
          />
        ))}
      </section>
      {!lesson.exampleSql && <TutorPanel lessonId={lesson.id} />}
    </main>
  );
}
