import { describe, expect, it } from "vitest";
import { displayNameSchema } from "@/features/profile/validation/profile";

describe("display name validation", () => {
  it("trims surrounding whitespace", () => {
    expect(displayNameSchema.parse("  Rani  ")).toBe("Rani");
  });

  it("treats an empty value as clearing the display name", () => {
    expect(displayNameSchema.parse("   ")).toBeNull();
  });

  it("limits display names to 60 characters", () => {
    expect(displayNameSchema.safeParse("a".repeat(61)).success).toBe(false);
  });
});
