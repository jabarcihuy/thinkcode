import { getLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/config";
import {
  authorizeGuest,
  saveGuest,
  rejectCrossOrigin,
  guestFailure,
  GuestError,
} from "@/features/guest/server/session";
import { consumeGuestQuota } from "@/features/guest/server/quota";
import {
  guestCatalog,
  guestMaterial,
  guestExercises,
} from "@/features/guest/server/catalog";
import { tutorRequestSchema } from "@/features/ai/validation/tutor-request";
import {
  createTutorMessages,
  nextHintLevel,
  isExplicitSolutionRequest,
} from "@/features/ai/domain/tutor-context";
import { OpenAICompatibleAIProvider } from "@/lib/providers/openai-compatible-ai-provider";
import { readLimitedJson } from "@/features/workspace/server/read-json";
export const runtime = "nodejs";
export const maxDuration = 65;
export async function GET() {
  try {
    await authorizeGuest();
    return Response.json(
      { sessionId: null, messages: [] },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return guestFailure(error);
  }
}
export async function POST(request: Request) {
  try {
    rejectCrossOrigin(request);
    const guest = await authorizeGuest();
    consumeGuestQuota(request, guest.id, "ai");
    let raw: unknown;
    try {
      raw = await readLimitedJson(request, 32_000);
    } catch {
      throw new GuestError(400, "Permintaan tidak valid.");
    }
    const parsed = tutorRequestSchema.safeParse(raw);
    if (!parsed.success)
      throw new GuestError(400, "Konteks tutor tidak valid.");
    const input = parsed.data;
    const outline = (await guestCatalog()).lessons.find(
      (l) => l.id === input.lessonId,
    );
    if (!outline) throw new GuestError(404, "Materi tidak tersedia.");
    const lesson = await guestMaterial(outline.slug);
    if (!lesson) throw new GuestError(404, "Materi tidak tersedia.");
    const exercise = input.exerciseId
      ? (await guestExercises(lesson.id)).find((e) => e.id === input.exerciseId)
      : null;
    if (input.exerciseId && !exercise)
      throw new GuestError(404, "Latihan tidak tersedia.");
    const hintLevel = nextHintLevel(
      input.action,
      guest.hintLevel,
      isExplicitSolutionRequest(input.message, input.action),
    );
    const messages = createTutorMessages(
      {
        lesson: {
          title: lesson.title,
          summary: lesson.summary,
          content: lesson.content.slice(0, 6000),
        },
        exercise: exercise
          ? {
              title: exercise.title,
              type: exercise.type,
              prompt: exercise.prompt,
            }
          : null,
        sourceCode: input.sourceCode,
        visibleOutput: input.visibleOutput,
        visibleTestResults: input.visibleTestResults,
        progressSummary: "Mode tamu; tidak ada progres yang disimpan.",
      },
      [],
      input.message,
      input.action,
      hintLevel,
      resolveLocale(await getLocale()),
    );
    let answer = "";
    for await (const chunk of new OpenAICompatibleAIProvider().stream({
      messages,
      maxOutputTokens: 800,
    })) {
      answer += chunk;
      if (answer.length >= 8000) {
        answer = answer.slice(0, 8000);
        break;
      }
    }
    await saveGuest({ ...guest, hintLevel });
    return new Response(answer, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
        "x-ai-hint-level": String(hintLevel),
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    return guestFailure(error);
  }
}
