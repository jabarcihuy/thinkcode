import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminAuthorizationError, authorizeAdmin } from "@/features/admin/server/authorization";

const mocks = vi.hoisted(() => ({ readUserId: vi.fn(), createClient: vi.fn() }));
vi.mock("@/lib/auth/identity", () => ({ readAuthenticatedUserId: mocks.readUserId }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

describe("admin server authorization", () => {
  afterEach(() => vi.clearAllMocks());

  function setup(role: string | null, userId: string | null = "admin-id") {
    mocks.readUserId.mockResolvedValue(userId);
    mocks.createClient.mockResolvedValue({ from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: role ? { role } : null, error: role ? null : {} }) }) }) }) });
  }

  it("denies USER and unauthenticated accounts", async () => {
    setup("USER");
    await expect(authorizeAdmin()).rejects.toMatchObject({ status: 403 });
    setup(null, null);
    await expect(authorizeAdmin()).rejects.toBeInstanceOf(AdminAuthorizationError);
    await expect(authorizeAdmin()).rejects.toMatchObject({ status: 401 });
  });

  it("allows ADMIN and returns the authenticated user id", async () => {
    setup("ADMIN");
    await expect(authorizeAdmin()).resolves.toBe("admin-id");
  });
});
