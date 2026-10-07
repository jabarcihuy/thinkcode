import { vi, it, expect, beforeEach } from "vitest";
const mock = vi.hoisted(() => ({
  get: vi.fn(),
  claims: vi.fn(),
  rpc: vi.fn(),
}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: mock.get }) }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getClaims: mock.claims },
    rpc: mock.rpc,
  }),
}));
import { authorizeGuest, assertNoAccountTest, rejectCrossOrigin } from "./session";
import { encodeGuest } from "../domain/session";
import { AuthSessionMissingError } from "@supabase/supabase-js";
beforeEach(() => {
  vi.resetAllMocks();
  process.env.SUPABASE_SECRET_KEY = "guest-test-key-only";
  mock.claims.mockResolvedValue({ data: null, error: null });
});
function token(activeTest: string | null = null) {
  return encodeGuest(
    {
      kind: "guest",
      id: "a918c984-9ce6-4cbe-a050-05cfcbe69f34",
      name: "Dinda",
      expires: Date.now() + 3600_000,
      activeTest,
      hintLevel: 0,
    },
    process.env.SUPABASE_SECRET_KEY!,
  );
}
it("rejects missing session and active demo test helpers", async () => {
  await expect(authorizeGuest()).rejects.toMatchObject({ status: 401 });
  mock.get.mockReturnValue({
    value: token("4b9d4fe6-b053-487b-a3ec-9430ca81f724"),
  });
  await expect(authorizeGuest()).rejects.toMatchObject({ status: 403 });
  await expect(authorizeGuest(true)).resolves.toMatchObject({ kind: "guest" });
});
it("accepts genuinely unauthenticated visitors", async () => {
  mock.claims.mockResolvedValue({
    data: null,
    error: new AuthSessionMissingError(),
  });
  await expect(assertNoAccountTest()).resolves.toBeUndefined();
});
it("does not bypass an active official assessment or a failed guard", async () => {
  mock.get.mockReturnValue({ value: token() });
  mock.claims.mockResolvedValue({
    data: { claims: { sub: "account-user" } },
    error: null,
  });
  mock.rpc.mockResolvedValue({ data: true, error: null });
  await expect(authorizeGuest(true)).rejects.toMatchObject({ status: 403 });
  mock.rpc.mockResolvedValue({ data: null, error: new Error("unavailable") });
  await expect(authorizeGuest()).rejects.toMatchObject({ status: 503 });
});

it("accepts local browser Host without accepting another Origin or protocol", () => {
 expect(() => rejectCrossOrigin(new Request("http://localhost:3225/api/guest/check", { headers: { host: "127.0.0.1:3225", origin: "http://127.0.0.1:3225" } }))).not.toThrow();
 expect(() => rejectCrossOrigin(new Request("https://app.example/api/guest/check", { headers: { host: "app.example", origin: "https://other.example" } }))).toThrow();
 expect(() => rejectCrossOrigin(new Request("https://app.example/api/guest/check", { headers: { host: "app.example", origin: "http://app.example" } }))).toThrow();
});
