import { readLimitedJson } from "@/features/workspace/server/read-json";
import { tutorRequestSchema } from "@/features/ai/validation/tutor-request";
import { authorizeTutor, getTutorHistory, prepareTutorStream, saveTutorReply, TutorRequestError } from "@/features/ai/server/tutor-service";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 65;

const historyQuerySchema = z.object({ lessonId: z.uuid(), exerciseId: z.uuid().optional() });

export async function GET(request: Request) {
  try {
    const query = historyQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
    if (!query.success) return Response.json({ error: "Konteks tutor tidak valid." }, { status: 400 });
    const { userId } = await authorizeTutor({ rateLimit: false });
    const history = await getTutorHistory(userId, query.data.lessonId, query.data.exerciseId);
    return Response.json(history, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof TutorRequestError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "Riwayat AI belum dapat dimuat." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const raw = await readLimitedJson(request, 32_000);
    const parsed = tutorRequestSchema.safeParse(raw);
    if (!parsed.success) return Response.json({ error: "Permintaan AI Tutor tidak valid." }, { status: 400 });

    const { userId } = await authorizeTutor();
    const prepared = await prepareTutorStream(userId, parsed.data);
    const encoder = new TextEncoder();
    let cancelled = false;
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let answer = "";
        try {
          if (!prepared.first.done) {
            answer += prepared.first.value;
            controller.enqueue(encoder.encode(prepared.first.value));
          }
          while (!cancelled) {
            const next = await prepared.chunks.next();
            if (next.done) break;
            const chunk = next.value.slice(0, Math.max(0, 8_000 - answer.length));
            if (chunk) { answer += chunk; controller.enqueue(encoder.encode(chunk)); }
            if (answer.length >= 8_000) break;
          }
          if (!cancelled) {
            await saveTutorReply(prepared.admin, prepared.sessionId, answer);
            controller.close();
          }
        } catch {
          if (!cancelled) {
            controller.enqueue(encoder.encode("\n\nAI Tutor sedang bermasalah. Coba lagi sebentar."));
            controller.close();
          }
        } finally {
          if (cancelled) await prepared.chunks.return?.();
        }
      },
      cancel() { cancelled = true; },
    });
    return new Response(stream, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store, no-transform",
        "x-ai-session-id": prepared.sessionId,
        "x-ai-hint-level": String(prepared.hintLevel),
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof TutorRequestError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "AI Tutor sedang tidak tersedia. Coba lagi sebentar." }, { status: 502 });
  }
}
