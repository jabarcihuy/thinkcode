import { MaterialReadingView } from "@/features/learning/components/material-reading-view";
import { notFound } from "next/navigation";
import { LearningHeader } from "@/features/learning/components/learning-header";
import { getAccessibleMaterial } from "@/features/learning/server/material-access";

export default async function LessonPage({ params }: { params: Promise<{ pathSlug: string; lessonSlug: string }> }) {
  const { pathSlug, lessonSlug } = await params;
  const access = await getAccessibleMaterial(pathSlug, lessonSlug);
  if (!access) notFound();
  const { account, overview, material, index } = access;
  return <div className="mobile-page-content min-h-dvh lg:pb-0"><LearningHeader account={account} /><MaterialReadingView overview={overview} index={index} content={material.content} authenticated={Boolean(account)} /></div>;
}
