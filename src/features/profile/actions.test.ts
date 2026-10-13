import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ account: vi.fn(), client: vi.fn(), privileged: vi.fn(), user: vi.fn(), update: vi.fn(), eq: vi.fn(), select: vi.fn(), single: vi.fn(), updateUser: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ requireAccount: mocks.account }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.client }));
vi.mock("@/lib/supabase/privileged", () => ({ createPrivilegedClient: mocks.privileged }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
import { updateDisplayNameAction } from "./actions";
function form() {
  const data = new FormData();
  for (const [key, value] of Object.entries({ display_name: "Rani", avatar: "cat", color: "rose", bio: "Learning SQL", id: "other-user", role: "ADMIN" })) data.set(key, value);
  return data;
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.account.mockResolvedValue({ userId: "authenticated-user" });
  mocks.client.mockResolvedValue({ auth: { getUser: mocks.user, updateUser: mocks.updateUser } });
  mocks.user.mockResolvedValue({ data: { user: { id: "authenticated-user" } }, error: null });
  mocks.privileged.mockReturnValue({ from: () => ({ update: mocks.update }) });
  mocks.update.mockReturnValue({ eq: mocks.eq }); mocks.eq.mockReturnValue({ select: mocks.select }); mocks.select.mockReturnValue({ maybeSingle: mocks.single });
  mocks.single.mockResolvedValue({ data: { id: "authenticated-user" }, error: null });
  mocks.updateUser.mockResolvedValue({ error: null });
});
describe("profile save authorization and errors", () => {
  it("writes only the authenticated name and validated cosmetic metadata", async () => {
    expect(await updateDisplayNameAction({}, form())).toHaveProperty("success");
    expect(mocks.eq).toHaveBeenCalledWith("id", "authenticated-user");
    expect(mocks.update).toHaveBeenCalledWith({ display_name: "Rani" });
    expect(mocks.updateUser).toHaveBeenCalledWith({ data: { quethink_profile: { avatar: "cat", color: "rose", bio: "Learning SQL" } } });
  });
  it("rejects invalid appearance before any mutation", async () => {
    const data = form(); data.set("avatar", "http://untrusted.test/image");
    expect(await updateDisplayNameAction({}, data)).toHaveProperty("error");
    expect(mocks.client).not.toHaveBeenCalled();
  });
  it("rejects unauthenticated callers", async () => {
    mocks.account.mockRejectedValue(new Error("unauthorized"));
    await expect(updateDisplayNameAction({}, form())).rejects.toThrow("unauthorized");
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });
  it("refuses a revoked or mismatched authenticated identity before privileged writes", async () => {
    mocks.user.mockResolvedValue({ data: { user: { id: "different-user" } }, error: null });
    expect(await updateDisplayNameAction({}, form())).toHaveProperty("error");
    expect(mocks.privileged).not.toHaveBeenCalled();
  });
  it("does not claim success for an RLS-denied or missing profile", async () => {
    mocks.single.mockResolvedValue({ data: null, error: null });
    expect(await updateDisplayNameAction({}, form())).toHaveProperty("error");
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });
  it("reports partial saves accurately if metadata persistence fails", async () => {
    mocks.updateUser.mockResolvedValue({ error: { message: "unavailable" } });
    expect(await updateDisplayNameAction({}, form())).toEqual({ error: "Nama tersimpan, tetapi avatar dan bio belum tersimpan. Coba simpan lagi." });
  });
});
