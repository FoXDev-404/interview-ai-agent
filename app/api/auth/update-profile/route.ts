import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/firebase/admin";
import { z } from "zod";
import {
  requireApiAuth,
  toApiAuthErrorResponse,
  type ApiAuthContext,
} from "@/lib/apiAuth";

const updateProfileSchema = z
  .object({
    displayName: z.string().trim().min(1).max(80).optional(),
    photoURL: z.union([z.string().max(700000), z.null()]).optional(),
    headline: z.string().trim().max(120).optional(),
    bio: z.string().trim().max(600).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export async function POST(request: NextRequest) {
  let authUser: ApiAuthContext;
  try {
    authUser = await requireApiAuth({
      request,
      routeId: "auth.update-profile",
    });
  } catch (error) {
    return toApiAuthErrorResponse(error);
  }

  try {
    const uid = authUser.uid;

    const parsedBody = updateProfileSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 },
      );
    }

    const { displayName, photoURL, headline, bio } = parsedBody.data;

    // Update the user's display name in Firebase Auth
    const updateData: { displayName?: string } = {};

    if (displayName !== undefined) {
      updateData.displayName = displayName;
    }

    // Only update displayName in Firebase Auth
    if (Object.keys(updateData).length > 0) {
      await auth.updateUser(uid, updateData);
    }

    // Store profile data (including photoURL) in Firestore
    if (db) {
      const userRef = db.collection("users").doc(uid);
      const profileData: {
        name?: string;
        displayName?: string;
        photoURL?: string | null;
        avatar?: string | null;
        headline?: string;
        bio?: string;
        updatedAt: Date;
      } = {
        updatedAt: new Date(),
      };

      if (displayName !== undefined) {
        profileData.name = displayName;
        profileData.displayName = displayName;
      }

      if (photoURL !== undefined) {
        const normalizedPhoto =
          typeof photoURL === "string" ? photoURL.trim() : photoURL;

        // Check if photoURL is null or empty, handle accordingly
        if (normalizedPhoto === null || normalizedPhoto === "") {
          // User is removing their profile photo
          profileData.photoURL = null;
          profileData.avatar = null;
        } else {
          // Check photoURL size before storing
          const photoSizeInBytes = (normalizedPhoto.length * 3) / 4;
          if (photoSizeInBytes > 500000) {
            // 500KB limit
            return NextResponse.json(
              {
                error:
                  "Profile image is too large. Please use a smaller image.",
              },
              { status: 400 },
            );
          }
          profileData.photoURL = normalizedPhoto;
          profileData.avatar = normalizedPhoto;
        }
      }

      if (headline !== undefined) {
        profileData.headline = String(headline).slice(0, 120);
      }

      if (bio !== undefined) {
        profileData.bio = String(bio).slice(0, 600);
      }

      await userRef.set(profileData, { merge: true });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      displayName,
      photoURL,
      headline,
      bio,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
