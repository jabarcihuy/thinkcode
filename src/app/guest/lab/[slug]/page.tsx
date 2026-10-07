import { notFound, redirect } from "next/navigation";
import { requireGuest } from "@/features/guest/server/session";
import { guestMaterial, guestExercises } from "@/features/guest/server/catalog";
import { GuestMaterialPageView } from "@/features/guest/components/material-page";
export default async function GuestLabPage({ params }: { params: Promise<{ slug: string }> }) {
 const guest = await requireGuest();
 if (guest.activeTest) redirect(`/guest/tests/${guest.activeTest}`);
 const { slug } = await params;
 const lesson = await guestMaterial(slug);
 if (!lesson) notFound();
 const exercises = await guestExercises(lesson.id);
 return <GuestMaterialPageView lessonId={lesson.id} content={lesson.content} exampleSql={lesson.exampleSql} exercises={exercises} userId={guest.id} lab />;
}
