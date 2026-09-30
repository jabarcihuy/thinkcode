import { afterEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/admin/[resource]/route";
import { PATCH, DELETE } from "@/app/api/admin/[resource]/[id]/route";
import { AdminAuthorizationError } from "./authorization";

const mocks = vi.hoisted(() => ({ authorize: vi.fn(), privileged: vi.fn() }));
vi.mock("./authorization", async (importOriginal) => ({ ...await importOriginal<typeof import("./authorization")>(), authorizeAdmin: mocks.authorize }));
vi.mock("@/lib/supabase/privileged", () => ({ createPrivilegedClient: mocks.privileged }));
afterEach(() => vi.resetAllMocks());

describe("admin API authorization on every operation", () => {
  it.each([401, 403] as const)("rejects unauthorized reads and mutations before privileged access: %s", async (status) => {
    mocks.authorize.mockRejectedValue(new AdminAuthorizationError(status));
    const context = { params: Promise.resolve({ resource: "lessons", id: "00000000-0000-4000-8000-000000000001" }) };
    const request = (method: string) => new Request("https://quethink.test/api/admin/lessons", { method, ...(method === "GET" ? {} : { body: "{}", headers: { "Content-Type": "application/json" } }) });
    for (const result of [await GET(request("GET"), context), await POST(request("POST"), context), await PATCH(request("PATCH"), context), await DELETE(request("DELETE"), context)]) expect(result.status).toBe(status);
    expect(mocks.privileged).not.toHaveBeenCalled();
  });
});
