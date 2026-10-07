import "server-only";
import { getLocale } from "next-intl/server";
import { cache } from "react";
import { resolveLocale } from "./config";
import { createTextTranslator } from "./translate";
export const getText = cache(async () => {
  const locale = resolveLocale(await getLocale());
  const [ui, course] = await Promise.all([
    locale === "en" ? import("./messages/ui.en.json") : import("./messages/ui.id.json"),
    locale === "en" ? import("./messages/course.en.json") : import("./messages/course.id.json"),
  ]);
  return createTextTranslator(locale, { ...ui.default, ...course.default });
});
