import { ActionCodeSettings } from 'firebase/auth';

// Get the base URL for email configurations
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // Check if we're running on Vercel and use the current deployment URL
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    // Fallback to configured site URL or default
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-mockprep-fixed.vercel.app';
  }
  return 'http://localhost:3000';
};

// Email verification configuration
export const emailVerificationConfig: ActionCodeSettings = {
  // The URL to redirect to after email verification - go directly to sign-in page
  url: `${getBaseUrl()}/sign-in?verified=true`,
  
  // This must be true for email verification
  handleCodeInApp: true,
};

// Simpler fallback configuration if the main one fails
export const fallbackEmailVerificationConfig: ActionCodeSettings = {
  // Just use the auth domain for the redirect
  url: 'https://ai-mockprep.firebaseapp.com/__/auth/action',
  handleCodeInApp: false, // Let Firebase handle it completely
};

// Email templates configuration (for Firebase console)
export const emailTemplateConfig = {
  verificationEmailSubject: 'Verify your email for AI MockPrep',
  verificationEmailBody: `
    Welcome to AI MockPrep!
    
    Please click the link below to verify your email address and activate your account:
    
    %LINK%
    
    If you didn't create an account with AI MockPrep, you can ignore this email.
    
    Thanks,
    The AI MockPrep Team
  `,
  
  passwordResetSubject: 'Reset your AI MockPrep password',
  passwordResetBody: `
    Hi there,
    
    You requested to reset your password for AI MockPrep. Click the link below to reset it:
    
    %LINK%
    
    If you didn't request this, you can ignore this email.
    
    Thanks,
    The AI MockPrep Team
  `
};
