import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { DecodedIdToken } from "firebase-admin/auth";
import { auth } from "@/firebase/admin";
import { recordFailedAuthAttempt } from "@/lib/security/computeProtection";

export interface ApiAuthContext {
  uid: string;
  email?: string;
  decodedClaims: DecodedIdToken;
}

export class ApiAuthError extends Error {
  status: number;

  constructor(message: string, status = 401, options?: { cause?: unknown }) {
    super(message);
    this.name = "ApiAuthError";
    this.status = status;
    if (options?.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

export async function requireApiAuth(options?: {
  request?: NextRequest;
  routeId?: string;
}): Promise<ApiAuthContext> {
  const routeId = options?.routeId || "api.unknown";
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    recordFailedAuthAttempt({
      request: options?.request,
      routeId,
      reason: "missing_session",
    });
    throw new ApiAuthError("Not authenticated", 401);
  }

  if (!auth) {
    recordFailedAuthAttempt({
      request: options?.request,
      routeId,
      reason: "auth_service_unavailable",
    });
    throw new ApiAuthError("Authentication service is unavailable", 503);
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      decodedClaims,
    };
  } catch (error) {
    recordFailedAuthAttempt({
      request: options?.request,
      routeId,
      reason: "invalid_session",
    });
    throw new ApiAuthError("Not authenticated", 401, { cause: error });
  }
}

export function toApiAuthErrorResponse(error: unknown) {
  if (error instanceof ApiAuthError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
