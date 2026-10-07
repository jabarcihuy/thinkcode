import { notFound, redirect } from "next/navigation";
import { requireGuest } from "@/features/guest/server/session";
import { guestTest } from "@/features/guest/server/catalog";
import { cancelGuestTest } from "@/features/guest/server/actions";
import { AssessmentWorkspace } from "@/features/assessment/components/assessment-workspace";
import { Button } from "@/components/ui/button";
export default async function GuestTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const guest = await requireGuest();
  const { id } = await params;
  if (guest.activeTest !== id) redirect("/guest?view=tests");
  const data = await guestTest(id);
  if (!data) notFound();
  return (
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <p className="mb-5 text-sm font-semibold text-primary">
        Tes percobaan · hasil tersimpan di perangkat ini
      </p>
      <AssessmentWorkspace
        demo
        sessionId={id}
        userId={guest.id}
        assessmentTitle={data.assessment.title}
        instructions={data.assessment.instructions}
        passingScore={data.assessment.passing_score}
        diagnostic={data.assessment.type === "PRETEST"}
        items={data.items}
      />
      <form action={cancelGuestTest} className="mt-6">
        <Button variant="outline">Keluar dari tes percobaan</Button>
      </form>
    </main>
  );
}
