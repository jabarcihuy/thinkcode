import { revalidatePath } from "next/cache";
import { getCurrentAccount } from "@/lib/auth/session";
import { getLearningOverview } from "@/features/learning/data/learning-repository";
import { lessonIdSchema } from "@/features/learning/validation/routes";
import { getGradingExercise, recordGradedAttempt } from "@/features/practice/data/exercise-repository";
import { gradeExercise, GradingConfigurationError } from "@/features/practice/domain/grade-exercise";
import { parseSubmission } from "@/features/practice/validation/submission";
import { consumeCodeQuota } from "@/features/workspace/server/rate-limit";
import { readLimitedJson } from "@/features/workspace/server/read-json";
import type { Json } from "@/types/database";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const account = await getCurrentAccount();
  if (!account) return Response.json({ error: "Masuk untuk memeriksa jawaban." }, { status: 401 });
  const { id } = await context.params;
  if (!lessonIdSchema.safeParse(id).success) return Response.json({ error: "Exercise tidak ditemukan." }, { status: 404 });

  let body: unknown;
  try { body = await readLimitedJson(request); }
  catch { return Response.json({ error: "Jawaban tidak valid atau terlalu besar." }, { status: 400 }); }

  try {
    const exercise = await getGradingExercise(id);
    if (!exercise) return Response.json({ error: "Exercise tidak ditemukan." }, { status: 404 });
    const submission = parseSubmission(exercise.type, body);
    if (!submission) return Response.json({ error: "Jawaban tidak valid." }, { status: 400 });
    const overview = await getLearningOverview(submission.pathSlug, account.userId);
    const lesson = overview?.lessons.find((item) => item.id === exercise.lessonId);
    if (!lesson || lesson.state === "LOCKED") return Response.json({ error: "Lesson belum tersedia." }, { status: 403 });
    if (!await consumeCodeQuota("check")) return Response.json({ error: "Terlalu banyak pemeriksaan. Coba lagi sebentar." }, { status: 429 });

    const graded = gradeExercise(exercise, submission);
    const safeFeedback: Json = {
      passed: graded.passed, score: graded.score, feedback: graded.feedback,
      visibleTests: graded.visibleTests.map((test) => ({
        position: test.position, passed: test.passed, status: test.status,
        actualOutput: test.actualOutput, expectedOutput: test.expectedOutput, detail: test.detail,
      })),
      hiddenPassed: graded.hiddenPassed, hiddenTotal: graded.hiddenTotal,
    };
    const lessonCompleted = await recordGradedAttempt({
      userId: account.userId, exerciseId: exercise.id, sourceCode: submission.sourceCode,
      answer: submission.answer, score: graded.score, passed: graded.passed,
      feedback: safeFeedback,
    });
    revalidatePath(`/learn/${submission.pathSlug}`);
    revalidatePath(`/learn/${submission.pathSlug}/lessons/${lesson.slug}`);
    revalidatePath("/dashboard");
    return Response.json({ ...graded, lessonCompleted });
  } catch (error) {
    if (error instanceof GradingConfigurationError) {
      return Response.json({ error: "Pemeriksaan belum tersedia. Coba lagi nanti." }, { status: 503 });
    }
    return Response.json({ error: "Pemeriksaan gagal diproses." }, { status: 503 });
  }
}
