import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { decodePhoto, isCloudPhoto } from "../domain/photo";
const envSchema = z.object({ cloud: z.string().regex(/^[\w-]+$/), key: z.string().min(1), secret: z.string().min(1) });
function configuration() {
  return envSchema.safeParse({ cloud: process.env.CLOUDINARY_CLOUD_NAME, key: process.env.CLOUDINARY_API_KEY, secret: process.env.CLOUDINARY_API_SECRET });
}
export function cloudinaryReady() { return configuration().success; }
const requests = new Map<string, { start: number; count: number }>();
export async function uploadProfilePhoto(userId: string, data: string): Promise<string> {
  const bytes = decodePhoto(data);
  if (!bytes) throw new Error("Foto tidak valid. Pilih JPG, PNG, atau WebP maksimal 5 MB.");
  const config = configuration();
  if (!config.success) throw new Error("Unggah foto akun belum tersedia. Cloudinary belum dikonfigurasi.");
  const now = Date.now();
  for (const [id, bucket] of requests) if (now - bucket.start > 3_600_000) requests.delete(id);
  const bucket = requests.get(userId) ?? { start: now, count: 0 };
  if (bucket.count >= 5 || !requests.has(userId) && requests.size >= 1000) throw new Error("Batas unggah foto tercapai. Coba lagi nanti.");
  bucket.count++; requests.set(userId, bucket);
  const publicId = `quethink/profiles/${userId}/avatar`;
  const parameters = { overwrite: "true", public_id: publicId, timestamp: String(Math.floor(now / 1000)), transformation: "c_fill,h_256,w_256" };
  const signature = createHash("sha1").update(Object.entries(parameters).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&") + config.data.secret).digest("hex");
  const form = new FormData();
  for (const [key, value] of Object.entries(parameters)) form.set(key, value);
  form.set("api_key", config.data.key); form.set("signature", signature);
  form.set("file", new Blob([new Uint8Array(bytes)], { type: "image/jpeg" }), "avatar.jpg");
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${config.data.cloud}/image/upload`, { method: "POST", body: form, signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error("provider failure");
    const payload = await response.json();
    if (payload.public_id !== publicId || typeof payload.secure_url !== "string" || !isCloudPhoto(payload.secure_url) || !payload.secure_url.startsWith(`https://res.cloudinary.com/${config.data.cloud}/image/upload/`)) throw new Error("invalid response");
    return payload.secure_url;
  } catch { throw new Error("Foto belum dapat diunggah. Coba lagi."); }
}
