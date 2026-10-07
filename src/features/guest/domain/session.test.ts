import { it, expect } from "vitest";
import {
  encodeGuest,
  decodeGuest,
  guestNameSchema,
  type GuestSession,
} from "./session";
const now = Date.now(),
  secret = "test-guest-signing-secret-only";
const guest: GuestSession = {
  kind: "guest",
  id: "a918c984-9ce6-4cbe-a050-05cfcbe69f34",
  name: "Dinda",
  expires: now + 3600_000,
  activeTest: null,
  hintLevel: 0,
};
it("verifies a purpose-signed named guest and rejects tampering/expiration", () => {
  const token = encodeGuest(guest, secret);
  expect(decodeGuest(token, secret, now)).toEqual(guest);
  expect(decodeGuest(token.replace(token[5]!, "X"), secret, now)).toBeNull();
  expect(decodeGuest(token, "another-key", now)).toBeNull();
  expect(decodeGuest(token, secret, now + 8 * 3600_000)).toBeNull();
  expect(decodeGuest("x".repeat(2049), secret, now)).toBeNull();
});
it("validates names and never accepts an admin identity", () => {
  for (const name of ["", "a", "<script>", "x".repeat(61)])
    expect(guestNameSchema.safeParse(name).success).toBe(false);
  expect(guestNameSchema.safeParse("Ayu Putri").success).toBe(true);
  expect(() =>
    encodeGuest({ ...guest, kind: "admin" } as unknown as GuestSession, secret),
  ).toThrow();
});
