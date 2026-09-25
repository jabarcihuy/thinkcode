import { NextResponse, type NextRequest } from "next/server";

/** Legacy email links must not verify accounts after signup confirmation is disabled. */
export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/login", request.url));
}
