"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccount } from "@/lib/auth/session";
import { startLesson } from "@/features/learning/services/progress-service";
import { lessonIdSchema, pathSlugSchema } from "@/features/learning/validation/routes";

function validateMutation(pathSlug: string, lessonId: string) {
  const path = pathSlugSchema.safeParse(pathSlug);
  const lesson = lessonIdSchema.safeParse(lessonId);
  if (!path.success || !lesson.success) throw new Error("Permintaan lesson tidak valid.");
  return { pathSlug: path.data, lessonId: lesson.data };
}

export async function startLessonAction(pathSlug: string, lessonId: string) {
  const input = validateMutation(pathSlug, lessonId);
  const account = await requireAccount();
  const lesson = await startLesson(account.userId, input.pathSlug, input.lessonId);
  revalidatePath(`/learn/${input.pathSlug}`);
  redirect(`/learn/${input.pathSlug}/lessons/${lesson.slug}`);
}
