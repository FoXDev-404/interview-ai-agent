import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static assets
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|js|css)$/)
  ) {
    return NextResponse.next();
  }

  // Public pages — accessible without login
  const publicPaths = [
    "/",
    "/sign-in",
    "/sign-up",
    "/verify-email",
    "/about",
    "/contact",
    "/help",
    "/privacy",
    "/terms",
  ];

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Everything else requires a session cookie
  const sessionCookie = request.cookies.get("session");

  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run proxy on ALL routes except static file bundles
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
