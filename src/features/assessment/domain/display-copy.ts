/** Localize legacy assessment copy without changing persisted identifiers or records. */
export function assessmentDisplayCopy(value: string, locale: "en" | "id" = "id"): string {
  return value.replace(/\bpre[- ]test\b/gi, locale === "en" ? "Pre-test" : "Tes Awal").replace(/\bpost[- ]test\b/gi, locale === "en" ? "Final Challenge" : "Tantangan Akhir");
}
