/** Localize legacy assessment copy without changing persisted identifiers or records. */
export function assessmentDisplayCopy(value: string): string {
  return value.replace(/\bpre[- ]test\b/gi, "Tes Awal").replace(/\bpost[- ]test\b/gi, "Tes Akhir");
}
