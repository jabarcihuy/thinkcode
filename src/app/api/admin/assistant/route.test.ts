import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ authorizeAdmin: vi.fn(), consumeCodeQuota: vi.fn(), generate: vi.fn(), AdminAuthorizationError: class AdminAuthorizationError extends Error { constructor() { super("Administrator access required."); } } }));
vi.mock("@/features/admin/server/authorization", () => ({ AdminAuthorizationError: mocks.AdminAuthorizationError, authorizeAdmin: mocks.authorizeAdmin }));
vi.mock("@/features/workspace/server/rate-limit", () => ({ consumeCodeQuota: mocks.consumeCodeQuota }));
vi.mock("@/lib/providers/openai-compatible-ai-provider", () => ({ OpenAICompatibleAIProvider: class { generate = mocks.generate; } }));

import { POST } from "@/app/api/admin/assistant/route";

describe("admin AI content assistant", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns a review-only draft and never publishes or persists content", async () => {
    mocks.authorizeAdmin.mockResolvedValue("admin-id");
    mocks.consumeCodeQuota.mockResolvedValue(true);
    mocks.generate.mockResolvedValue({ content: "Draft explanation: a loop repeats a bounded set of steps." });
    const response = await POST(new Request("http://localhost/api/admin/assistant", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "explanation", context: "Introduce for loops to a beginner." }),
    }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ draft: "Draft explanation: a loop repeats a bounded set of steps.", status: "DRAFT_REQUIRES_ADMIN_REVIEW" });
    expect(body).not.toHaveProperty("is_published");
    expect(body).not.toHaveProperty("id");
    expect(mocks.generate).toHaveBeenCalledOnce();
  });

  it("rejects malformed draft requests without calling the provider", async () => {
    mocks.authorizeAdmin.mockResolvedValue("admin-id");
    mocks.consumeCodeQuota.mockResolvedValue(true);
    const response = await POST(new Request("http://localhost/api/admin/assistant", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "publish", context: "variables" }),
    }));
    expect(response.status).toBe(422);
    expect(mocks.generate).not.toHaveBeenCalled();
  });
});
