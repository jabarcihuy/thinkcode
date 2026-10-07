import {
  authorizeGuest,
  rejectCrossOrigin,
  guestFailure,
  GuestError,
} from "@/features/guest/server/session";
import { consumeGuestQuota } from "@/features/guest/server/quota";
import { guestCatalog } from "@/features/guest/server/catalog";
import { getGradingExercise } from "@/features/practice/data/exercise-repository";
import { gradeExercise } from "@/features/practice/domain/grade-exercise";
import { parseSubmission } from "@/features/practice/validation/submission";
import { readLimitedJson } from "@/features/workspace/server/read-json";
import { z } from "zod";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    rejectCrossOrigin(request);
    const guest = await authorizeGuest();
    consumeGuestQuota(request, guest.id, "check");
    const { id } = await params;
    if (!z.uuid().safeParse(id).success)
      throw new GuestError(404, "Latihan tidak ditemukan.");
    const exercise = await getGradingExercise(id);
    if (
      !exercise ||
      !(await guestCatalog()).lessons.some((l) => l.id === exercise.lessonId)
    )
      throw new GuestError(404, "Latihan tidak ditemukan.");
    let body: unknown;
    try {
      body = await readLimitedJson(request);
    } catch {
      throw new GuestError(400, "Jawaban tidak valid.");
    }
    const submission = parseSubmission(exercise.type, body);
    if (!submission || submission.pathSlug !== "database-fundamentals")
      throw new GuestError(400, "Jawaban tidak valid.");
    return Response.json(
      { ...gradeExercise(exercise, submission), lessonCompleted: false },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return guestFailure(error);
  }
}
