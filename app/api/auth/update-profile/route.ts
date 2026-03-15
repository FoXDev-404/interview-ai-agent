import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth, db } from '@/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify the session cookie
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;

    // Get the request body
    const { displayName, photoURL, headline, bio } = await request.json();

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
      const userRef = db.collection('users').doc(uid);
      const profileData: {
        name?: string;
        displayName?: string;
        photoURL?: string | null;
        avatar?: string | null;
        headline?: string;
        bio?: string;
        updatedAt: Date;
      } = {
        updatedAt: new Date()
      };

      if (displayName !== undefined) {
        profileData.name = displayName;
        profileData.displayName = displayName;
      }

      if (photoURL !== undefined) {
        // Check if photoURL is null or empty, handle accordingly
        if (photoURL === null || photoURL === '') {
          // User is removing their profile photo
          profileData.photoURL = null;
          profileData.avatar = null;
        } else {
          // Check photoURL size before storing
          const photoSizeInBytes = (photoURL.length * 3) / 4;
          if (photoSizeInBytes > 500000) { // 500KB limit
            return NextResponse.json(
              { error: 'Profile image is too large. Please use a smaller image.' },
              { status: 400 }
            );
          }
          profileData.photoURL = photoURL;
          profileData.avatar = photoURL;
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
      message: 'Profile updated successfully',
      displayName,
      photoURL,
      headline,
      bio,
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
