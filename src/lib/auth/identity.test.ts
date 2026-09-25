import { describe, expect, it } from "vitest";
import { readAuthenticatedUserId } from "./identity";

describe("readAuthenticatedUserId", () => {
  it("returns the verified claims subject", async () => {
    const result = await readAuthenticatedUserId({ getClaims: async () => ({ data: { claims: { sub: "user-1" } }, error: null }) });
    expect(result).toBe("user-1");
  });

  it("rejects missing or failed claims", async () => {
    expect(await readAuthenticatedUserId({ getClaims: async () => ({ data: { claims: null }, error: null }) })).toBeNull();
    expect(await readAuthenticatedUserId({ getClaims: async () => ({ data: { claims: { sub: "forged" } }, error: new Error("invalid") }) })).toBeNull();
  });
});
