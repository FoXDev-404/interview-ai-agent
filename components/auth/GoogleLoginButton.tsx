"use client";

import Image from "next/image";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase/client";
import { signIn, signUp } from "@/lib/actions/auth.action";
import { toast } from "sonner";
import { useState } from "react";

type Props = {
  onSuccess?: () => void;
};

export default function GoogleLoginButton({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) {
        toast.error("Google account has no email");
        return;
      }

      const idToken = await user.getIdToken();

      const signInResult = await signIn({ email: user.email, idToken });

      if (!signInResult.success && signInResult.message.includes("User does not exist")) {
        const signUpResult = await signUp({
          uid: user.uid,
          name: user.displayName || "User",
          email: user.email,
        });

        if (!signUpResult.success) {
          toast.error(signUpResult.message);
          return;
        }

        const finalSignIn = await signIn({ email: user.email, idToken });
        if (!finalSignIn.success) {
          toast.error(finalSignIn.message);
          return;
        }
      } else if (!signInResult.success) {
        toast.error(signInResult.message);
        return;
      }

      toast.success("Signed in with Google!");
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Google login error:", error);
      const firebaseError = error as { code?: string };

      if (firebaseError.code === "auth/popup-closed-by-user") {
        toast.info("Login cancelled");
      } else {
        toast.error("Google sign-in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      suppressHydrationWarning
      className="auth-google-btn"
    >
      <Image src="/google.png" alt="Google" width={20} height={20} className="rounded-sm bg-white p-[2px]" />
      <span>{loading ? "Signing in..." : "Continue with Google"}</span>
    </button>
  );
}
