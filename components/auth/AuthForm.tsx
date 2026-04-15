"use client";

import { useState } from "react";
import AuthHeader from "./AuthHeader";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import GoogleLoginButton from "./GoogleLoginButton";
import EmailVerification from "@/components/EmailVerification";
import PasswordReset from "@/components/PasswordReset";
import Link from "next/link";
import { getSafeNextPath } from "@/lib/security/redirect";

export default function AuthForm({
  type,
  nextPath = "/",
}: {
  type: FormType;
  nextPath?: string;
}) {
  const [email, setEmail] = useState("");
  const [showVerify, setShowVerify] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const redirectTarget = getSafeNextPath(nextPath, "/");

  // Password reset screen
  if (showReset && type === "sign-in") {
    return (
      <div className="auth-card">
        <AuthHeader type={type} />
        <PasswordReset onBack={() => setShowReset(false)} />
      </div>
    );
  }

  // Email verification screen
  if (showVerify && type === "sign-up") {
    return (
      <div className="auth-card">
        <AuthHeader type={type} />
        <EmailVerification email={email} />
      </div>
    );
  }

  return (
    <div className="auth-card">
      <AuthHeader type={type} />

      {/* Google login */}
      {type === "sign-in" && (
        <GoogleLoginButton
          onSuccess={() => {
            window.location.href = redirectTarget;
          }}
        />
      )}

      {/* Divider */}
      {type === "sign-in" && (
        <div className="auth-divider">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">or continue with email</span>
          <div className="auth-divider-line" />
        </div>
      )}

      {/* Forms */}
      {type === "sign-in" ? (
        <SignInForm
          onForgotPassword={() => setShowReset(true)}
          nextPath={redirectTarget}
        />
      ) : (
        <SignUpForm
          onVerificationRequired={(email) => {
            setEmail(email);
            setShowVerify(true);
          }}
        />
      )}

      {/* Switch link */}
      <p className="text-center text-sm text-light-400 mt-2">
        {type === "sign-in" ? "No account yet?" : "Already have an account?"}{" "}
        <Link
          href={type === "sign-in" ? "/sign-up" : "/sign-in"}
          className="font-semibold text-primary-200 hover:text-primary-100 transition-colors"
        >
          {type === "sign-in" ? "Sign up" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
