import { LearningPathView } from "@/features/learning/components/learning-path-view";
import { notFound } from "next/navigation";
import { getCurrentAccount } from "@/lib/auth/session";
import { LearningHeader } from "@/features/learning/components/learning-header";
import { getLearningOverview } from "@/features/learning/data/learning-repository";
import { pathSlugSchema } from "@/features/learning/validation/routes";

export default async function LearningPathPage({ params }: { params: Promise<{ pathSlug: string }> }) {
  const { pathSlug } = await params;
  if (!pathSlugSchema.safeParse(pathSlug).success) notFound();
  const account = await getCurrentAccount();
  const overview = await getLearningOverview(pathSlug, account?.userId ?? null);
  if (!overview) notFound();
  return <div className="mobile-page-content min-h-dvh lg:pb-0"><LearningHeader account={account} /><LearningPathView overview={overview} authenticated={Boolean(account)} /></div>;
}
