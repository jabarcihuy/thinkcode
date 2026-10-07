import { z } from "zod";
import {
  authorizeGuest,
  rejectCrossOrigin,
  guestFailure,
  GuestError,
} from "@/features/guest/server/session";
import { consumeGuestQuota } from "@/features/guest/server/quota";
import { readLimitedJson } from "@/features/workspace/server/read-json";
import { generateSqlabDraft } from "@/features/sqlab/server/generate";
import { OpenAICompatibleAIProvider } from "@/lib/providers/openai-compatible-ai-provider";
export const runtime = "nodejs";
export const maxDuration = 65;
export async function POST(request: Request) {
  try {
    rejectCrossOrigin(request);
    const guest = await authorizeGuest();
    consumeGuestQuota(request, guest.id, "ai");
    let raw: unknown;
    try {
      raw = await readLimitedJson(request, 10_000);
    } catch {
      throw new GuestError(400, "Permintaan tidak valid.");
    }
    const parsed = z
      .object({ prompt: z.string().trim().min(10).max(2000) })
      .safeParse(raw);
    if (!parsed.success)
      throw new GuestError(400, "Jelaskan database dalam 10–2.000 karakter.");
    const draft = await generateSqlabDraft(
      new OpenAICompatibleAIProvider(),
      parsed.data.prompt,
    );
    return Response.json(
      { draft },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return guestFailure(error);
  }
}
