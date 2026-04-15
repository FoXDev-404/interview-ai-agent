import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/firebase/admin";
import { getSafeNextPath } from "@/lib/security/redirect";

const PUBLIC_PATHS = new Set([
  "/",
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/about",
  "/contact",
  "/help",
  "/privacy",
  "/terms",
]);

function redirectToSignIn(request: NextRequest, nextPath: string) {
  const signInUrl = new URL("/sign-in", request.url);

  if (nextPath !== "/") {
    signInUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(signInUrl);
}

export async function proxy(request: NextRequest) {
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
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const nextPath = getSafeNextPath(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    "/",
  );
  const sessionCookie = request.cookies.get("session")?.value;

  if (!sessionCookie) {
    return redirectToSignIn(request, nextPath);
  }

  // Fail closed when auth service is unavailable.
  if (!auth) {
    return redirectToSignIn(request, nextPath);
  }

  try {
    await auth.verifySessionCookie(sessionCookie, true);
  } catch {
    return redirectToSignIn(request, nextPath);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run proxy on ALL routes except static file bundles
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
