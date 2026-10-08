import "server-only";
import { isAuthSessionMissingError } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { encodeGuest, decodeGuest, type GuestSession } from "../domain/session";
const COOKIE = "quethink_guest";
function secret() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("Guest signing is not configured.");
  return key;
}
export class GuestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function getGuest() {
  const guest = decodeGuest((await cookies()).get(COOKIE)?.value, secret());
  if (!guest?.activeTest) return guest;
  const { data, error } = await createPrivilegedClient().from("assessments").select("id").eq("id", guest.activeTest).eq("is_published", true).neq("type", "PRETEST").maybeSingle();
  if (error) throw new GuestError(503, "Status tes belum dapat diperiksa.");
  return data ? guest : { ...guest, activeTest: null };
}
export async function requireGuest() {
  const guest = await getGuest();
  if (!guest) redirect("/guest/start");
  await assertNoAccountTest();
  return guest;
}
export async function authorizeGuest(allowTest = false) {
  const guest = await getGuest();
  if (!guest) throw new GuestError(401, "Isi nama untuk mencoba sebagai tamu.");
  await assertNoAccountTest();
  if (guest.activeTest && !allowTest)
    throw new GuestError(
      403,
      "Selesaikan atau keluar dari tes percobaan terlebih dahulu.",
    );
  return guest;
}
export async function saveGuest(guest: GuestSession) {
  (await cookies()).set(COOKIE, encodeGuest(guest, secret()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}
export async function clearGuest() {
  (await cookies()).delete(COOKIE);
}
export function rejectCrossOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const url = new URL(request.url);
  // Next can normalize request.url to localhost for a local-IP request.
  // The browser controls Host; use its actual destination, never Origin as authority.
  const host = request.headers.get("host");
  let sameOrigin = origin === url.origin;
  if (!sameOrigin && host && !/[\s,/@]/.test(host)) {
    try { sameOrigin = origin === new URL(`${url.protocol}//${host}`).origin; } catch { sameOrigin = false; }
  }
  if (!sameOrigin) throw new GuestError(403, "Permintaan tidak diizinkan.");
}
export function guestFailure(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof GuestError
          ? error.message
          : "Percobaan belum dapat diproses. Coba lagi.",
    },
    {
      status: error instanceof GuestError ? error.status : 503,
      headers: { "cache-control": "no-store" },
    },
  );
}

/** A signed-in learner cannot switch to guest endpoints to bypass an official test block. */
export async function assertNoAccountTest() {
  const db = await createClient();
  const { data, error } = await db.auth.getClaims();
  if (isAuthSessionMissingError(error)) return;
  if (error) throw new GuestError(503, "Status akun belum dapat diperiksa.");
  if (!data?.claims?.sub) return;
  const active = await db.rpc("current_user_has_active_assessment");
  if (active.error)
    throw new GuestError(503, "Status tes belum dapat diperiksa.");
  if (active.data)
    throw new GuestError(
      403,
      "Selesaikan tes akun sebelum menggunakan mode tamu.",
    );
}
