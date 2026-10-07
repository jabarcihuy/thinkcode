import type { Locale } from "./config";
export type TextCatalog = Record<string, string>;
/** Localize presentation only. Identifiers, submitted answers and query values stay unchanged. */
export function createTextTranslator(locale: Locale, catalog: TextCatalog) {
  const templates = Object.entries(catalog).filter(([key]) => key.includes("${"))
    .map(([key, value]) => ({ key, value, pattern: new RegExp("^" + key.split(/\$\{\d+\}/).map(part => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("([\\s\\S]*?)") + "$") }));
  function translate<T extends string | undefined | null>(text: T): T {
    if (text == null) return text;
    const exact = catalog[text];
    if (exact !== undefined) return exact as T;
    const normalized = text.replace(/\s+/g, " ").trim();
    if (catalog[normalized] !== undefined) return catalog[normalized]! as T;
    for (const { key, pattern, value } of templates) {
      const match = text.match(pattern);
      if (match) return value.replace(/\$\{(\d+)\}/g, (_, index: string) => (["Materi ${0} · ${1}", "Bug Lab: ${0}", "Praktik: ${0}"].includes(key) ? catalog[match[Number(index) + 1] ?? ""] : undefined) ?? match[Number(index) + 1] ?? "") as T;
    }
    // User-authored text and SQL/data are not translated by guessing or an online service.
    if (text.includes("\n\n")) return text.split(/(\n\n+)/).map(part => /^\n+$/.test(part) ? part : translate(part)).join("") as T;
    void locale;
    return text;
  }
  return translate;
}
