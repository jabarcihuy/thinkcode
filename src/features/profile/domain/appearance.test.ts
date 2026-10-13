import { describe, expect, it } from "vitest";
import { appearanceSchema, defaultAppearance, readAppearance } from "./appearance";
import { emptyGuestProgress, guestProgressSchema } from "@/features/guest/domain/local-progress";
describe("profile appearance boundary", () => {
  it("accepts cosmetic settings and trims the bio", () => {
    expect(readAppearance({ avatar: "cat", color: "teal", bio: "  Learning SQL  " })).toEqual({ avatar: "cat", color: "teal", bio: "Learning SQL" });
  });
  it("rejects URLs, arbitrary colors and oversized bios", () => {
    for (const value of [{ ...defaultAppearance, avatar: "https://example.com/a.svg" }, { ...defaultAppearance, color: "url(x)" }, { ...defaultAppearance, bio: "a".repeat(161) }]) expect(appearanceSchema.safeParse(value).success).toBe(false);
  });
  it("drops authority fields and never treats them as appearance", () => {
    expect(readAppearance({ ...defaultAppearance, role: "ADMIN", userId: "other" })).toEqual(defaultAppearance);
  });
  it("restores old guest progress with default appearance without losing progress", () => {
    const legacy = { name: "", read: {}, passedExercises: [], tests: {} };
    expect(guestProgressSchema.parse({ ...legacy, name: "Rani" })).toEqual({ ...emptyGuestProgress, name: "Rani" });
  });
  it("falls back safely for missing or corrupted metadata", () => {
    expect(readAppearance(undefined)).toEqual(defaultAppearance);
    expect(readAppearance({ avatar: "arbitrary" })).toEqual(defaultAppearance);
  });
});
