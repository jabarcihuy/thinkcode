import { redirect } from "next/navigation";
import { requireGuest } from "@/features/guest/server/session";
import { GuestLearningPages } from "@/features/guest/components/learning-pages";
export default async function GuestPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
 const guest = await requireGuest();
 const { view = "" } = await searchParams;
 if (guest.activeTest && ["materials", "lab", "sqlab", "chatbot"].includes(view)) redirect(`/guest/tests/${guest.activeTest}`);
 return <GuestLearningPages view={view} userId={guest.id} activeTest={guest.activeTest} />;
}
