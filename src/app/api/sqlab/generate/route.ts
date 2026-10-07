import { localeFromRequest } from "@/i18n/config";
import { z } from "zod";
import {
  authorizeTutor,
  TutorRequestError,
} from "@/features/ai/server/tutor-service";
import { readLimitedJson } from "@/features/workspace/server/read-json";
import { OpenAICompatibleAIProvider } from "@/lib/providers/openai-compatible-ai-provider";
import { generateSqlabDraft } from "@/features/sqlab/server/generate";
export const runtime = "nodejs";
export const maxDuration = 65;
const requestSchema = z.object({ prompt: z.string().trim().min(10).max(2000) });
export async function POST(request: Request) {
  try {
    if (
      request.headers.get("origin") &&
      request.headers.get("origin") !== new URL(request.url).origin
    )
      return Response.json(
        { error: "Permintaan tidak diizinkan." },
        { status: 403 },
      );
    await authorizeTutor(); // Auth, fail-closed assessment guard and shared AI quota.
    let body: unknown;
    try {
      body = await readLimitedJson(request, 10_000);
    } catch {
      return Response.json(
        { error: "Permintaan terlalu besar atau tidak valid." },
        { status: 400 },
      );
    }
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success)
      return Response.json(
        { error: "Jelaskan database yang diinginkan dalam 10–2.000 karakter." },
        { status: 400 },
      );
    const draft = await generateSqlabDraft(
      new OpenAICompatibleAIProvider(),
      parsed.data.prompt,
      localeFromRequest(request),
    );
    return Response.json(
      { draft },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof TutorRequestError)
      return Response.json({ error: error.message }, { status: error.status });
    return Response.json(
      {
        error:
          "AI belum menghasilkan rancangan yang valid. Perjelas permintaan lalu coba lagi.",
      },
      { status: 502 },
    );
  }
}
