import { describe, expect, it } from "vitest";
import { hasRole, parseRole } from "./roles";

describe("role authorization", () => {
  it("accepts only supported roles", () => {
    expect(parseRole("USER")).toBe("USER");
    expect(parseRole("ADMIN")).toBe("ADMIN");
    expect(parseRole("TEACHER")).toBeNull();
    expect(parseRole(true)).toBeNull();
  });

  it("allows admins into user space and blocks users from admin space", () => {
    expect(hasRole("USER", "USER")).toBe(true);
    expect(hasRole("USER", "ADMIN")).toBe(false);
    expect(hasRole("ADMIN", "USER")).toBe(true);
    expect(hasRole("ADMIN", "ADMIN")).toBe(true);
  });
});
