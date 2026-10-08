import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/app", "/dashboard/:path*", "/admin/:path*", "/lab/:path*", "/pre-test/:path*", "/post-test/:path*", "/assessments/:path*", "/chatbot/:path*", "/playground/:path*", "/schema-builder/:path*", "/profile/:path*", "/forum/:path*", "/learn/:path*", "/login", "/register", "/auth/:path*"],
};
