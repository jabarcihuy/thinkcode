import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { decodePhoto } from "../domain/photo";
import { cloudinaryReady, uploadProfilePhoto } from "./cloudinary";
const photo = "data:image/jpeg;base64," + Buffer.from([255,216,255,192,0,11,8,1,0,1,0,1,1,17,0,255,217]).toString("base64");
beforeEach(() => {
  vi.stubEnv("CLOUDINARY_CLOUD_NAME", "test-cloud"); vi.stubEnv("CLOUDINARY_API_KEY", "test-key"); vi.stubEnv("CLOUDINARY_API_SECRET", "private-test-secret");
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("bounded profile photo uploads", () => {
  it("rejects remote URLs, SVGs, malformed JPEG and oversized data", () => {
    for (const value of ["https://example.com/photo.jpg", "data:image/svg+xml;base64,AAAA", "data:image/jpeg;base64,A", "data:image/jpeg;base64," + "A".repeat(180_000)]) expect(decodePhoto(value)).toBeNull();
  });
  it("requires 256px dimensions", () => {
    expect(decodePhoto(photo)).not.toBeNull();
    const bytes = Buffer.from(photo.split(",")[1]!, "base64"); bytes[8] = 2;
    expect(decodePhoto("data:image/jpeg;base64," + bytes.toString("base64"))).toBeNull();
  });
  it("fails closed if configuration is missing", async () => {
    vi.stubEnv("CLOUDINARY_API_SECRET", ""); expect(cloudinaryReady()).toBe(false);
    await expect(uploadProfilePhoto("owner", photo)).rejects.toThrow("Cloudinary");
  });
  it("uploads only bytes under a server-selected owner ID and signs privately", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ public_id: "quethink/profiles/owner/avatar", secure_url: "https://res.cloudinary.com/test-cloud/image/upload/v1/quethink/profiles/owner/avatar.jpg" }) });
    vi.stubGlobal("fetch", fetcher);
    expect(await uploadProfilePhoto("owner", photo)).toContain("/owner/avatar.jpg");
    const [url, request] = fetcher.mock.calls[0]!;
    expect(url).toBe("https://api.cloudinary.com/v1_1/test-cloud/image/upload");
    expect(request.body.get("public_id")).toBe("quethink/profiles/owner/avatar");
    expect(request.body.get("file")).toBeInstanceOf(Blob);
    expect(request.body.get("signature")).toMatch(/^[a-f0-9]{40}$/);
    expect([...request.body.values()]).not.toContain("private-test-secret");
  });
  it("rejects mismatched provider assets instead of trusting their URL", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ public_id: "other", secure_url: "https://evil.test/photo.jpg" }) }));
    await expect(uploadProfilePhoto("untrusted-response", photo)).rejects.toThrow("Foto belum");
  });
  it("sanitizes provider failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("private provider details")));
    await expect(uploadProfilePhoto("failure", photo)).rejects.toThrow("Foto belum dapat diunggah. Coba lagi.");
  });
  it("limits repeated uploads per account", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ public_id: "quethink/profiles/quota/avatar", secure_url: "https://res.cloudinary.com/test-cloud/image/upload/v1/quethink/profiles/quota/avatar.jpg" }) }));
    for (let i = 0; i < 5; i++) await uploadProfilePhoto("quota", photo);
    await expect(uploadProfilePhoto("quota", photo)).rejects.toThrow("Batas unggah");
  });

});
