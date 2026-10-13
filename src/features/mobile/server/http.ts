import "server-only";
import { MobileError } from "./auth";
export function mobileJson(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "cache-control": "private, no-store", "vary": "Authorization, X-Quethink-Locale" } });
}
export async function mobileHandler(work: () => Promise<unknown>) {
  try { return mobileJson(await work()); }
  catch (error) {
    if (error instanceof MobileError) return mobileJson({ code: error.code, error: error.message }, error.status);
    return mobileJson({ code: "unavailable", error: "Could not load learning data. Please try again." }, 503);
  }
}
