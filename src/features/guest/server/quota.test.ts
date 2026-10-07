import { vi, it, expect } from "vitest";
it("bounds AI usage even when a visitor changes guest identity", async () => {
  vi.resetModules();
  const { consumeGuestQuota } = await import("./quota");
  const request = new Request("http://localhost/api/guest/tutor");
  for (let i = 0; i < 6; i++) consumeGuestQuota(request, `guest-${i}`, "ai");
  expect(() => consumeGuestQuota(request, "new-identity", "ai")).toThrow(
    "Batas percobaan",
  );
});
