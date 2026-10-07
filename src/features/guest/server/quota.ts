import "server-only";
import { createHash } from "node:crypto";
import { GuestError } from "./session";
// Bounded process-local abuse guard. Deployments need an upstream shared WAF limit too.
const windows = new Map<string, { count: number; expires: number }>();
export function consumeGuestQuota(
  request: Request,
  id: string,
  kind: "ai" | "check" | "test",
) {
  const now = Date.now();
  for (const [key, row] of windows) if (row.expires <= now) windows.delete(key);
  const address = process.env.VERCEL
    ? (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown")
    : "local";
  const ip = createHash("sha256").update(address).digest("hex");
  const limits: Array<[string, number, number]> = [
    [`${kind}:ip:${ip}`, kind === "ai" ? 6 : 30, 60_000],
    [`${kind}:session:${id}`, kind === "ai" ? 8 : 40, 3600_000],
    [`${kind}:global`, kind === "ai" ? 60 : 240, 3600_000],
  ];
  for (const [key, maximum] of limits)
    if ((windows.get(key)?.count ?? 0) >= maximum)
      throw new GuestError(429, "Batas percobaan tercapai. Coba lagi nanti.");
  if (windows.size + limits.length > 2000)
    throw new GuestError(
      429,
      "Layanan percobaan sedang sibuk. Coba lagi nanti.",
    );
  for (const [key, , duration] of limits) {
    const row = windows.get(key) ?? { count: 0, expires: now + duration };
    row.count++;
    windows.set(key, row);
  }
}
