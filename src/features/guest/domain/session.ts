import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
export const guestNameSchema = z
  .string()
  .trim()
  .min(2, "Isi nama minimal 2 karakter.")
  .max(60)
  .regex(/^[\p{L}\p{N} .'-]+$/u, "Gunakan nama dengan huruf atau angka.");
export const guestSessionSchema = z
  .object({
    kind: z.literal("guest"),
    id: z.uuid(),
    name: guestNameSchema,
    expires: z.number().int(),
    activeTest: z.uuid().nullable(),
    hintLevel: z.number().int().min(0).max(5),
  })
  .strict();
export type GuestSession = z.infer<typeof guestSessionSchema>;
const sign = (data: string, secret: string) =>
  createHmac("sha256", secret)
    .update(`quethink-guest-v1:${data}`)
    .digest("base64url");
export function encodeGuest(session: GuestSession, secret: string) {
  const data = Buffer.from(
    JSON.stringify(guestSessionSchema.parse(session)),
  ).toString("base64url");
  return `${data}.${sign(data, secret)}`;
}
export function decodeGuest(
  token: string | undefined,
  secret: string,
  now = Date.now(),
): GuestSession | null {
  if (!token || token.length > 2048) return null;
  const [data, signature, extra] = token.split(".");
  if (!data || !signature || extra) return null;
  const expected = Buffer.from(sign(data, secret));
  const supplied = Buffer.from(signature);
  if (
    expected.length !== supplied.length ||
    !timingSafeEqual(expected, supplied)
  )
    return null;
  try {
    const result = guestSessionSchema.safeParse(
      JSON.parse(Buffer.from(data, "base64url").toString()),
    );
    return result.success &&
      result.data.expires > now &&
      result.data.expires <= now + 8 * 3600_000 + 300_000
      ? result.data
      : null;
  } catch {
    return null;
  }
}
