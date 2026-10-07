import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireGuest } from "@/features/guest/server/session";
import { guestMaterial, guestExercises } from "@/features/guest/server/catalog";
import { DatasetLabSwitcher } from "@/features/database/components/dataset-lab-switcher";
import { CampusDataPreview } from "@/features/database/components/campus-data-preview";
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
      <h1 className="mt-3 text-3xl font-semibold">
        Lab Materi · {lesson.title}
      </h1>
      {lesson.exampleSql ? (
        <DatasetLabSwitcher
          userId={guest.id}
          lessonId={lesson.id}
          scenarios={lessonScenarios(slug, {
            title: lesson.title,
            prompt: getLessonLabPrompt(lesson.exampleSql, slug),
            sql: lesson.exampleSql,
          })}
        />
      ) : (
        <div className="mt-6">
          <CampusDataPreview />
        </div>
      )}
      <section className="mt-8">
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
