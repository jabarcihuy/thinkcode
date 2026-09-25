export class AssessmentTutorBlockedError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function assertAssessmentInactive(active: boolean | null): void {
  if (active === null) throw new AssessmentTutorBlockedError(503, "Status assessment belum dapat diperiksa. Coba lagi.");
  if (active) throw new AssessmentTutorBlockedError(403, "AI Tutor tidak tersedia selama assessment aktif.");
}
