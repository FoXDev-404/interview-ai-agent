import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth, db } from "@/firebase/admin";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value, true);
    
    // Get the user record to access displayName
    const userRecord = await auth.getUser(decodedClaims.uid);
    
    // Get additional profile data from Firestore
    let photoURL = userRecord.photoURL;
    let displayName = userRecord.displayName;
    let bio = '';
    let headline = '';

    if (db) {
      try {
        const userDoc = await db.collection('users').doc(decodedClaims.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData) {
            // Use Firestore data if available, fallback to Auth data
            photoURL = userData.avatar || userData.photoURL || photoURL;
            displayName = userData.name || userData.displayName || displayName;
            bio = userData.bio || '';
            headline = userData.headline || '';
          }
        }
      } catch (firestoreError) {
        console.error('Error fetching user data from Firestore:', firestoreError);
        // Continue with Auth data only
      }
    }
    
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      name: displayName || decodedClaims.name || 'User',
      photoURL: photoURL || undefined,
      bio,
      headline,
    };
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }
  return user;
}
