import { describe, expect, it } from "vitest";
import { guestNavigationView } from "./navigation";
describe("guest navigation", () => {
  it.each([
    ["/guest", null, ""], ["/guest/materials/relasi", null, "materials"],
    ["/guest/lab/relasi", null, "menu"], ["/guest/tests/pre-test", null, "tests"],
    ["/guest", "sqlab", "menu"], ["/guest", "chatbot", "menu"], ["/guest", "profile", "profile"],
  ])("selects one destination for %s %s", (path, view, expected) => {
    expect(guestNavigationView(path, view)).toBe(expected);
  });
});
