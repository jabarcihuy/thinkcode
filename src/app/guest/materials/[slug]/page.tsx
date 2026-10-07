import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireGuest } from "@/features/guest/server/session";
import { guestMaterial } from "@/features/guest/server/catalog";
import { LessonContent } from "@/features/learning/components/lesson-content";
import { MaterialDownload } from "@/features/learning/components/material-download";
import { Button } from "@/components/ui/button";
export default async function GuestMaterialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const guest = await requireGuest();
  if (guest.activeTest) redirect(`/guest/tests/${guest.activeTest}`);
  const { slug } = await params;
  const lesson = await guestMaterial(slug);
  if (!lesson) notFound();
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <Link
        href="/guest?view=materials"
        className="inline-flex min-h-11 items-center text-sm text-primary"
      >
        ← Semua materi
      </Link>
      <p className="mt-4 text-sm text-muted-foreground">
        Mode tamu · progres tidak disimpan
      </p>
      <h1 className="mt-3 text-3xl font-semibold">
        Materi {lesson.number}. {lesson.title}
      </h1>
      <p className="mt-4 leading-7 text-muted-foreground">{lesson.summary}</p>
      <div className="mt-5">
        <MaterialDownload
          href={`/api/guest/pdf/${slug}`}
          number={lesson.number}
        />
      </div>
      <div className="mt-8">
        <LessonContent content={lesson.content} />
      </div>
      <Button asChild className="mt-8">
        <Link href={`/guest/lab/${slug}`}>Coba Lab Materi</Link>
      </Button>
    </main>
  );
}
