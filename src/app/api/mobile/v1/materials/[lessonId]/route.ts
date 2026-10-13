import { authenticateMobile } from "@/features/mobile/server/auth";
import { mobileHandler } from "@/features/mobile/server/http";
import { mobileText } from "@/features/mobile/server/localization";
import { readMobileMaterial } from "@/features/mobile/server/learning-service";
export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  return mobileHandler(async () => { const actor = await authenticateMobile(request); const { lessonId } = await params; return readMobileMaterial(actor, lessonId, await mobileText(request)); });
}
