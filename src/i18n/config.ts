export const locales = ["en", "id"] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = "en";
export const localeCookie = "quethink_locale";
export function resolveLocale(value: unknown): Locale {
  return value === "id" ? "id" : defaultLocale;
}

export function localeFromRequest(request: Request): Locale {
  const entry = request.headers.get("cookie")?.split(";").map(value => value.trim()).find(value => value.startsWith(localeCookie + "="));
  return resolveLocale(entry?.slice(localeCookie.length + 1));
}
