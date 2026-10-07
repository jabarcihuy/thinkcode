import { vi, it, expect, beforeEach } from "vitest";
vi.mock("@/features/ai/server/tutor-service", () => ({
  authorizeTutor: vi.fn(),
  TutorRequestError: class extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
}));
vi.mock("./generate", () => ({ generateSqlabDraft: vi.fn() }));
import {
  authorizeTutor,
  TutorRequestError,
} from "@/features/ai/server/tutor-service";
import { generateSqlabDraft } from "./generate";
import { POST } from "@/app/api/sqlab/generate/route";
import { fixture } from "../domain/test-fixture";
const request = (payload: unknown = { prompt: "Buat perpustakaan" }) =>
  new Request("http://localhost/api/sqlab/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
beforeEach(() => vi.resetAllMocks());
it("returns a draft for an authorized learner", async () => {
  vi.mocked(generateSqlabDraft).mockResolvedValue(fixture);
  const res = await POST(request());
  expect(res.status).toBe(200);
  expect((await res.json()).draft).toEqual(fixture);
});
it.each([401, 403, 429, 503])(
  "preserves auth, assessment, quota and fail-closed rejection %s",
  async (status) => {
    vi.mocked(authorizeTutor).mockRejectedValue(
      new TutorRequestError(status, "Blocked"),
    );
    expect((await POST(request())).status).toBe(status);
    expect(generateSqlabDraft).not.toHaveBeenCalled();
  },
);
it("rejects invalid input and handles provider failure", async () => {
  expect((await POST(request({ prompt: "x" }))).status).toBe(400);
  vi.mocked(generateSqlabDraft).mockRejectedValue(
    new Error("Secret provider error"),
  );
  const res = await POST(request());
  expect(res.status).toBe(502);
  expect(JSON.stringify(await res.json())).not.toContain("Secret provider");
});
