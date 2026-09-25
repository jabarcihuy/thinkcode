import { describe, expect, it } from "vitest";
import { assertAssessmentInactive, AssessmentTutorBlockedError } from "@/features/ai/domain/assessment-guard";

describe("AI assessment guard", () => {
  it("allows tutoring when no assessment is active", () => {
    expect(() => assertAssessmentInactive(false)).not.toThrow();
  });

  it("blocks tutoring during an active assessment", () => {
    expect(() => assertAssessmentInactive(true)).toThrowError(AssessmentTutorBlockedError);
    try { assertAssessmentInactive(true); } catch (error) { expect((error as AssessmentTutorBlockedError).status).toBe(403); }
  });

  it("fails closed when assessment state cannot be read", () => {
    expect(() => assertAssessmentInactive(null)).toThrowError(AssessmentTutorBlockedError);
  });
});
