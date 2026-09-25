import { z } from "zod";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { consumeCodeQuota } from "@/features/workspace/server/rate-limit";
import { AssessmentAuthError, authenticateAssessmentUser } from "@/features/assessment/server/authenticate";
import { assessmentSubmissionSchema } from "@/features/assessment/validation/submission";
import { getAssessmentSession } from "@/features/assessment/data/assessment-repository";
import { gradeAssessment } from "@/features/assessment/domain/grade-assessment";
import { QuickJSSandboxAdapter } from "@/features/assessment/providers/quickjs-sandbox-adapter";
import { readLimitedJson } from "@/features/workspace/server/read-json";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { userId } = await authenticateAssessmentUser();
    if (!(await consumeCodeQuota("assessment"))) return Response.json({ error: "Batas pengiriman assessment tercapai. Coba lagi sebentar." }, { status: 429 });
    const { sessionId } = await params;
    if (!z.uuid().safeParse(sessionId).success) return Response.json({ error: "Assessment tidak ditemukan." }, { status: 404 });
    const submission = assessmentSubmissionSchema.safeParse(await readLimitedJson(request, 100_000));
    if (!submission.success) return Response.json({ error: "Jawaban tidak lengkap atau formatnya tidak valid." }, { status: 400 });

    const admin = createPrivilegedClient();
    const session = await getAssessmentSession(sessionId, userId);
    if (!session) return Response.json({ error: "Assessment tidak ditemukan." }, { status: 404 });
    if (session.session.status !== "IN_PROGRESS") return Response.json({ error: "Assessment ini sudah dikirim." }, { status: 409 });
    const itemIds = session.items.map((item) => item.id);
    const [{ data: privateItems, error: itemError }, { data: tests, error: testError }] = await Promise.all([
      admin.from("assessment_items").select("id, answer_config, entry_function, weight").eq("assessment_id", session.session.assessment_id),
      admin.from("assessment_test_cases").select("assessment_item_id, args, stdin, expected_output, is_hidden, weight, position")
        .in("assessment_item_id", itemIds).order("position"),
    ]);
    if (itemError || testError || !privateItems) throw new Error("Assessment configuration unavailable.");
    const testsByItem = new Map<string, NonNullable<typeof tests>>();
    for (const test of tests ?? []) {
      const rows = testsByItem.get(test.assessment_item_id) ?? [];
      rows.push(test);
      testsByItem.set(test.assessment_item_id, rows);
    }
    const gradingItems = session.items.map((item) => {
      const privateItem = privateItems.find((candidate) => candidate.id === item.id);
      if (!privateItem) throw new Error("Assessment item configuration unavailable.");
      return {
        ...item,
        answerConfig: privateItem.answer_config,
        entryFunction: privateItem.entry_function,
        weight: privateItem.weight,
        tests: (testsByItem.get(item.id) ?? []).map((test) => ({
          args: test.args, stdin: test.stdin, expectedOutput: test.expected_output,
          isHidden: test.is_hidden, weight: test.weight, position: test.position,
        })),
      };
    });
    const grade = await gradeAssessment(gradingItems, submission.data, new QuickJSSandboxAdapter(), session.assessment.passingScore);
    const safeFeedback = {
      totalCorrect: grade.totalCorrect,
      totalItems: grade.totalItems,
      hiddenPassed: grade.hiddenPassed,
      hiddenTotal: grade.hiddenTotal,
      topicSummary: grade.topicSummary,
      itemResults: grade.itemResults.map((item) => ({
        itemId: item.itemId, topic: item.topic, passed: item.passed, score: item.score,
        passedTests: item.passedTests, totalTests: item.totalTests, hiddenPassed: item.hiddenPassed,
        hiddenTotal: item.hiddenTotal, visibleTests: item.visibleTests,
      })),
    };
    const { data: finalized, error: finalizeError } = await admin.rpc("finalize_assessment_session", {
      p_session_id: sessionId,
      p_score: grade.score,
      p_answers: { answers: submission.data.answers },
      p_safe_feedback: safeFeedback,
    });
    if (finalizeError) throw finalizeError;
    if (!finalized) return Response.json({ error: "Assessment ini sudah dikirim." }, { status: 409 });
    return Response.json({
      score: grade.score, passed: grade.passed, passingScore: session.assessment.passingScore,
      totalCorrect: grade.totalCorrect, totalItems: grade.totalItems,
      hiddenPassed: grade.hiddenPassed, hiddenTotal: grade.hiddenTotal,
      topicSummary: grade.topicSummary,
      itemResults: grade.itemResults.map(({ itemId, topic, passed, score, passedTests, totalTests, hiddenPassed, hiddenTotal, visibleTests }) => ({
        itemId, topic, passed, score, passedTests, totalTests, hiddenPassed, hiddenTotal, visibleTests,
      })),
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof AssessmentAuthError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "Assessment belum dapat diperiksa. Jawabanmu tetap tersimpan di halaman ini; coba kirim lagi." }, { status: 503 });
  }
}
