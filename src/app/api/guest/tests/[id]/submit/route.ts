import {
  authorizeGuest,
  saveGuest,
  rejectCrossOrigin,
  guestFailure,
  GuestError,
} from "@/features/guest/server/session";
import { consumeGuestQuota } from "@/features/guest/server/quota";
import { guestTest, guestGradingItems } from "@/features/guest/server/catalog";
import { assessmentSubmissionSchema } from "@/features/assessment/validation/submission";
import { readAssessmentDraft } from "@/features/assessment/domain/assessment-draft";
import { gradeAssessment } from "@/features/assessment/domain/grade-assessment";
import { QuickJSSandboxAdapter } from "@/features/assessment/providers/quickjs-sandbox-adapter";
import { SqliteAssessmentAdapter } from "@/features/assessment/providers/sqlite-assessment-adapter";
import { readLimitedJson } from "@/features/workspace/server/read-json";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    rejectCrossOrigin(request);
    const guest = await authorizeGuest(true);
    const { id } = await params;
    if (guest.activeTest !== id)
      throw new GuestError(
        409,
        "Mulai tes percobaan sebelum mengirim jawaban.",
      );
    consumeGuestQuota(request, guest.id, "test");
    const data = await guestTest(id);
    if (!data) throw new GuestError(404, "Tes tidak tersedia.");
    let raw: unknown;
    try {
      raw = await readLimitedJson(request, 100_000);
    } catch {
      throw new GuestError(400, "Jawaban tidak valid.");
    }
    const submission = assessmentSubmissionSchema.safeParse(raw);
    if (
      !submission.success ||
      !readAssessmentDraft(
        {
          activeIndex: 0,
          answers: Object.fromEntries(
            submission.data.answers.map((e) => [e.itemId, e.answer]),
          ),
        },
        data.items,
      )
    )
      throw new GuestError(400, "Jawab setiap soal tepat sekali.");
    const gradingItems = await guestGradingItems(id, data.items);
    const grade = await gradeAssessment(
      gradingItems,
      submission.data,
      new QuickJSSandboxAdapter(),
      data.assessment.passing_score,
      new SqliteAssessmentAdapter(),
    );
    await saveGuest({ ...guest, activeTest: null });
    return Response.json(
      {
        score: grade.score,
        totalCorrect: grade.totalCorrect,
        totalItems: grade.totalItems,
        passed: data.assessment.type !== "PRETEST" && grade.passed,
        saved: false,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return guestFailure(error);
  }
}
