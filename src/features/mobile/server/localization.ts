import "server-only";
import { createTextTranslator } from "@/i18n/translate";
import { resolveLocale } from "@/i18n/config";
export async function mobileText(request: Request) {
  const locale = resolveLocale(request.headers.get("x-quethink-locale"));
  const [ui, course] = await Promise.all([
    locale === "en" ? import("@/i18n/messages/ui.en.json") : import("@/i18n/messages/ui.id.json"),
    locale === "en" ? import("@/i18n/messages/course.en.json") : import("@/i18n/messages/course.id.json"),
  ]);
  return createTextTranslator(locale, { ...ui.default, ...course.default });
}
