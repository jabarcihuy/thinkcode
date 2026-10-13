import { authenticateMobile } from "@/features/mobile/server/auth";
import { mobileHandler } from "@/features/mobile/server/http";
import { acknowledgeMobileReading } from "@/features/mobile/server/learning-service";
export const runtime = "nodejs";
export async function POST(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  return mobileHandler(async () => { const actor = await authenticateMobile(request); const { lessonId } = await params; return acknowledgeMobileReading(actor, lessonId); });
}
