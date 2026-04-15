import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  ApiAuthError,
  requireApiAuth,
  toApiAuthErrorResponse,
} from "@/lib/apiAuth";

export async function GET() {
  try {
    await requireApiAuth();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({
      uid: user.uid,
      email: user.email,
      name: user.name,
      photoURL: user.photoURL,
      bio: user.bio || "",
      headline: user.headline || "",
    });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return toApiAuthErrorResponse(error);
    }

    console.error("Error getting current user:", error);
    return NextResponse.json(
      { error: "Failed to get user information" },
      { status: 500 },
    );
  }
}
