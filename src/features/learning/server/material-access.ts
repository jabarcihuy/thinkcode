import "server-only";
import { getCurrentAccount } from "@/lib/auth/session";
import { getLearningOverview, getLessonMaterial } from "../data/learning-repository";
import { resolveLessonRoute } from "../domain/progression";
import { lessonSlugSchema, pathSlugSchema } from "../validation/routes";

/** One access policy for reading, practice and PDF; downloading never changes progress. */
export async function getAccessibleMaterial(pathSlug: string, lessonSlug: string) {
  if (!pathSlugSchema.safeParse(pathSlug).success || !lessonSlugSchema.safeParse(lessonSlug).success) return null;
  const account = await getCurrentAccount();
  const overview = await getLearningOverview(pathSlug, account?.userId ?? null);
  if (!overview) return null;
  const lesson = resolveLessonRoute(overview.lessons, lessonSlug, Boolean(account));
  if (!lesson) return null;
  const material = await getLessonMaterial(lesson.id);
  if (!material) return null;
  const index = overview.lessons.findIndex((item) => item.id === lesson.id);
  return { account, overview, lesson, material, index };
}
