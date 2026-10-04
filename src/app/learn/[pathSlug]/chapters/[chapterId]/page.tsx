import { notFound, redirect } from "next/navigation";
import { getCurrentAccount } from "@/lib/auth/session";
import { getLearningOverview } from "@/features/learning/data/learning-repository";
import { chapterIdSchema, pathSlugSchema } from "@/features/learning/validation/routes";

export default async function ChapterPage({ params }: { params: Promise<{ pathSlug: string; chapterId: string }> }) {
  const { pathSlug, chapterId } = await params;
  if (!pathSlugSchema.safeParse(pathSlug).success || !chapterIdSchema.safeParse(chapterId).success) notFound();
  const account = await getCurrentAccount();
  const overview = await getLearningOverview(pathSlug, account?.userId ?? null);
  const chapter = overview?.chapters.find((item) => item.id === chapterId);
  if (!overview || !chapter) notFound();
  redirect(`/learn/${pathSlug}`);
}
