import { NextRequest, NextResponse } from "next/server";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { auth as clientAuth } from "@/firebase/client";
import { z } from "zod";
import {
  requireApiAuth,
  toApiAuthErrorResponse,
  type ApiAuthContext,
} from "@/lib/apiAuth";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(8).max(128),
  })
  .strict();

export async function POST(request: NextRequest) {
  let authUser: ApiAuthContext;
  try {
    authUser = await requireApiAuth({
      request,
      routeId: "auth.change-password",
    });
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

    const parsedBody = changePasswordSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = parsedBody.data;

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
      console.error("change_password_authentication_failed", {
        code:
          authError && typeof authError === "object" && "code" in authError
            ? (authError as { code?: string }).code || "unknown"
            : "unknown",
      });

      // Handle specific Firebase auth errors
      const error = authError as { code?: string };
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 401 },
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
          { status: 401 },
        );
      }

      return NextResponse.json(
        { error: "Failed to verify current password" },
        { status: 401 },
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
