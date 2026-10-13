import { authenticateMobile } from "@/features/mobile/server/auth";
import { mobileHandler } from "@/features/mobile/server/http";
import { mobileText } from "@/features/mobile/server/localization";
import { readMobileCourse } from "@/features/mobile/server/learning-service";
export const runtime = "nodejs";
export async function GET(request: Request) { return mobileHandler(async () => readMobileCourse(await authenticateMobile(request), await mobileText(request))); }
