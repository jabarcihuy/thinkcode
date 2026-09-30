import { afterEach, describe, expect, it, vi } from "vitest";
import { getAdminLessonPreview } from "./lesson-preview";

const mocks = vi.hoisted(() => ({ authorize: vi.fn(), privileged: vi.fn() }));
vi.mock("./authorization", () => ({ authorizeAdmin: mocks.authorize }));
vi.mock("@/lib/supabase/privileged", () => ({ createPrivilegedClient: mocks.privileged }));
afterEach(() => vi.resetAllMocks());
const id = "00000000-0000-4000-8000-000000000001";

describe("admin lesson preview authorization", () => {
  it.each([401, 403])("denies access before creating a privileged client: %s", async (status) => {
    mocks.authorize.mockRejectedValue({ status });
    await expect(getAdminLessonPreview(id)).rejects.toMatchObject({ status });
    expect(mocks.privileged).not.toHaveBeenCalled();
  });
  it("validates identifiers after authorization and avoids malformed queries", async () => {
    mocks.authorize.mockResolvedValue("admin");
    expect(await getAdminLessonPreview("not-an-id")).toBeNull();
    expect(mocks.privileged).not.toHaveBeenCalled();
  });
  it("loads draft materials without reading prerequisites, progress, or answer keys", async () => {
    mocks.authorize.mockResolvedValue("admin");
    const select = vi.fn();
    const from = vi.fn((table: string) => ({ select: (fields: string) => {
      select(fields);
      return { eq: () => ({ maybeSingle: async () => ({ data: { id, chapter_id: id, title: "Draft lesson", is_published: false }, error: null }),
        single: async () => ({ data: table === "chapters" ? { id, title: "Chapter", learning_path_id: id } : { id, slug: "database-fundamentals", title: "Database" }, error: null }),
        order: async () => ({ data: [], error: null }) }) };
    } }));
    const client = { from, rpc: vi.fn() };
    mocks.privileged.mockReturnValue(client);
    const preview = await getAdminLessonPreview(id);
    expect(preview?.lesson.is_published).toBe(false);
    expect(preview?.exercises).toEqual([]);
    expect(client.rpc).not.toHaveBeenCalled();
    expect(from.mock.calls.map(([table]) => table)).not.toContain("lesson_progress");
    expect(from.mock.calls.map(([table]) => table)).not.toContain("test_cases");
    for (const [fields] of select.mock.calls) { expect(fields).not.toContain("answer"); expect(fields).not.toContain("solution"); expect(fields).not.toBe("*"); }
  });
});
