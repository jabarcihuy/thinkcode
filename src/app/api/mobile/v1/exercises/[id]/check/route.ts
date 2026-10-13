import { z } from "zod";
import { authenticateMobile, MobileError } from "@/features/mobile/server/auth";
import { mobileHandler } from "@/features/mobile/server/http";
import { mobileText } from "@/features/mobile/server/localization";
import { checkMobileExercise } from "@/features/mobile/server/learning-service";
import { readLimitedJson } from "@/features/workspace/server/read-json";
export const runtime = "nodejs";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return mobileHandler(async () => {
    const actor = await authenticateMobile(request); const { id } = await params;
    if (!z.uuid().safeParse(id).success) throw new MobileError(404, "not_found", "Exercise not found.");
    let body: unknown; try { body = await readLimitedJson(request, 60_000); } catch { throw new MobileError(400, "invalid_input", "Your answer is invalid or too large."); }
    return checkMobileExercise(actor, id, body, await mobileText(request));
  });
}
