import { notFound, redirect } from "next/navigation";
import { requireGuest } from "@/features/guest/server/session";
import { guestMaterial } from "@/features/guest/server/catalog";
import { GuestMaterialPageView } from "@/features/guest/components/material-page";
export default async function GuestMaterialPage({ params }: { params: Promise<{ slug: string }> }) {
 const guest = await requireGuest();
 if (guest.activeTest) redirect(`/guest/tests/${guest.activeTest}`);
 const { slug } = await params;
 const lesson = await guestMaterial(slug);
 if (!lesson) notFound();
 return <GuestMaterialPageView lessonId={lesson.id} content={lesson.content} exampleSql={lesson.exampleSql} exercises={[]} userId={guest.id} />;
}
