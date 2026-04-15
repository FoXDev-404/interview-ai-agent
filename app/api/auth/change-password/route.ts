import { NextRequest, NextResponse } from "next/server";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { auth as clientAuth } from "@/firebase/client";
import {
  requireApiAuth,
  toApiAuthErrorResponse,
  type ApiAuthContext,
} from "@/lib/apiAuth";

export async function POST(request: NextRequest) {
  let authUser: ApiAuthContext;
  try {
    authUser = await requireApiAuth();
  } catch (error) {
    return toApiAuthErrorResponse(error);
  }

  try {
    const email = authUser.email;

    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 },
      );
    }

    // Get the request body
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    try {
      // First, verify the current password by signing in
      const userCredential = await signInWithEmailAndPassword(
        clientAuth,
        email,
        currentPassword,
      );
      const user = userCredential.user;

      // If we reach here, the current password is correct
      // Now update the password
      await updatePassword(user, newPassword);

      return NextResponse.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (authError: unknown) {
      console.error("Authentication error:", authError);

      // Handle specific Firebase auth errors
      const error = authError as { code?: string };
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 },
        );
      } else if (error.code === "auth/weak-password") {
        return NextResponse.json(
          { error: "New password is too weak" },
          { status: 400 },
        );
      } else if (error.code === "auth/requires-recent-login") {
        return NextResponse.json(
          {
            error:
              "Please sign out and sign back in before changing your password",
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: "Failed to verify current password" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 },
    );
  }
}
