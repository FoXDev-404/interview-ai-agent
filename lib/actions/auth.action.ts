"use server";

import { db, auth } from "@/firebase/admin";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";

function getAuthErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }

  return undefined;
}

function getPreferredName(params: {
  tokenName?: string | null;
  userName?: string | null;
  fallbackEmail: string;
  providedName?: string;
}) {
  const candidate =
    params.providedName?.trim() ||
    params.userName?.trim() ||
    params.tokenName?.trim();

  if (candidate) {
    return candidate.slice(0, 80);
  }

  return params.fallbackEmail.split("@")[0]?.slice(0, 80) || "User";
}

async function decodeVerifiedIdentity(idToken: string) {
  const decodedToken = await auth.verifyIdToken(idToken);
  const tokenEmail = decodedToken.email?.trim().toLowerCase();

  if (!decodedToken.email_verified) {
    return {
      success: false as const,
      message:
        "Please verify your email before signing in. Check your inbox for verification email.",
    };
  }

  if (!tokenEmail) {
    return {
      success: false as const,
      message:
        "Unable to verify account email. Please try a different sign-in method.",
    };
  }

  return {
    success: true as const,
    decodedToken,
    tokenEmail,
  };
}

async function syncUserProfileFromToken(params: {
  uid: string;
  email: string;
  tokenName?: string | null;
  providedName?: string;
}) {
  const userRecord = await auth.getUser(params.uid);
  const userRef = db.collection("users").doc(params.uid);
  const existingDoc = await userRef.get();
  const existingProfile = existingDoc.exists
    ? (existingDoc.data() as {
        interviewsCompleted?: number;
        totalScore?: number;
        averageScore?: number;
        leaderboardScore?: number;
        streak?: number;
      })
    : undefined;
  const resolvedName = getPreferredName({
    providedName: params.providedName,
    tokenName: params.tokenName,
    userName: userRecord.displayName,
    fallbackEmail: params.email,
  });

  await userRef.set(
    {
      name: resolvedName,
      displayName: resolvedName,
      email: params.email,
      avatar: userRecord.photoURL || null,
      photoURL: userRecord.photoURL || null,
      interviewsCompleted: existingProfile?.interviewsCompleted ?? 0,
      totalScore: existingProfile?.totalScore ?? 0,
      averageScore: existingProfile?.averageScore ?? 0,
      leaderboardScore: existingProfile?.leaderboardScore ?? 0,
      streak: existingProfile?.streak ?? 0,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
  const { idToken, name } = params;

  try {
    const identity = await decodeVerifiedIdentity(idToken);

    if (!identity.success) {
      return identity;
    }

    await syncUserProfileFromToken({
      uid: identity.decodedToken.uid,
      email: identity.tokenEmail,
      tokenName: identity.decodedToken.name,
      providedName: name,
    });

    return {
      success: true,
      message: "Account setup completed successfully.",
    };
  } catch (e: unknown) {
    console.error("auth_sign_up_failed", {
      code: getAuthErrorCode(e) || "unknown",
    });

    const error = e as { code?: string };
    if (error.code === "auth/id-token-expired") {
      return {
        success: false,
        message: "Session expired. Please sign in again.",
      };
    }

    if (
      error.code === "auth/invalid-id-token" ||
      error.code === "auth/argument-error"
    ) {
      return {
        success: false,
        message: "Invalid authentication token. Please sign in again.",
      };
    }

    return {
      success: false,
      message: "Failed to create an account",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { idToken } = params;
  try {
    const identity = await decodeVerifiedIdentity(idToken);

    if (!identity.success) {
      return identity;
    }

    await syncUserProfileFromToken({
      uid: identity.decodedToken.uid,
      email: identity.tokenEmail,
      tokenName: identity.decodedToken.name,
    });

    await setSessionCookie(idToken);

    return {
      success: true,
      message: "Successfully signed in",
    };
  } catch (e: unknown) {
    console.error("auth_sign_in_failed", {
      code: getAuthErrorCode(e) || "unknown",
    });

    const authError = e as { code?: string };

    if (authError.code === "auth/id-token-expired") {
      return {
        success: false,
        message: "Session expired. Please sign in again.",
      };
    } else if (
      authError.code === "auth/invalid-id-token" ||
      authError.code === "auth/argument-error"
    ) {
      return {
        success: false,
        message: "Invalid authentication token. Please sign in again.",
      };
    } else if (authError.code === "auth/user-not-found") {
      return {
        success: false,
        message:
          "Account not found. Please contact support if this issue persists.",
      };
    }

    return {
      success: false,
      message: "Failed to log in Account ",
    };
  }
}

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK * 1000,
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    console.error("Error during logout:", error);
    return {
      success: false,
      message: "Failed to logout",
    };
  }
}

export async function updateUserDisplayName(displayName: string) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false,
        message: "Not authenticated",
      };
    }

    const normalizedName = displayName.trim().slice(0, 80);

    if (!normalizedName) {
      return {
        success: false,
        message: "Display name cannot be empty",
      };
    }

    // Update the user's display name in Firebase Auth
    await auth.updateUser(currentUser.uid, {
      displayName: normalizedName,
    });

    // Also update in Firestore for consistency
    await db.collection("users").doc(currentUser.uid).set(
      {
        name: normalizedName,
        displayName: normalizedName,
        updatedAt: new Date().toISOString(),
      },
      {
        merge: true,
      },
    );

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating user display name:", error);
    return {
      success: false,
      message: "Failed to update profile",
    };
  }
}
