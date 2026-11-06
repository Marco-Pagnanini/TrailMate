import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isValidSessionToken } from "@/lib/session";

// Optimistic check: bounce unauthenticated visitors away from /admin.
// The admin page and actions re-verify the session server-side.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await isValidSessionToken(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/admin/login") {
    return authed ? NextResponse.redirect(new URL("/admin", req.url)) : NextResponse.next();
  }
  if (!authed) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
