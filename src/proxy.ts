import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/chatbot/:path*", "/playground/:path*", "/schema-builder/:path*", "/profile/:path*", "/learn/:path*", "/login", "/register", "/auth/:path*"],
};
