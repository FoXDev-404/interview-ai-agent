import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { DecodedIdToken } from "firebase-admin/auth";
import { auth } from "@/firebase/admin";

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

export async function requireApiAuth(): Promise<ApiAuthContext> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    throw new ApiAuthError("Not authenticated", 401);
  }

  if (!auth) {
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
