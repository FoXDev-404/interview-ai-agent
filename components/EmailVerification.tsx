'use client'

import { useState } from 'react'
import { sendEmailVerification } from 'firebase/auth'
import { auth } from '@/firebase/client'
import { emailVerificationConfig, fallbackEmailVerificationConfig } from '@/lib/email/config'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Mail, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EmailVerificationProps {
  email: string
}

const EmailVerification = ({ email }: EmailVerificationProps) => {
  const [sending, setSending] = useState(false)
  const router = useRouter()

  const handleResendVerification = async () => {
    if (!auth.currentUser) {
      toast.error('No user found. Please try signing up again.')
      return
    }

    setSending(true)
    try {
      // Try simple approach first
      await sendEmailVerification(auth.currentUser);
      toast.success('Verification email sent! Please check your inbox.')
    } catch (error: unknown) {
      console.error('Simple email verification failed:', error)
      // Try with custom configuration
      try {
        await sendEmailVerification(auth.currentUser, emailVerificationConfig)
        toast.success('Verification email sent! Please check your inbox.')
      } catch (customError: unknown) {
        console.error('Custom email verification failed:', customError)
        // Try with fallback configuration
        try {
          await sendEmailVerification(auth.currentUser, fallbackEmailVerificationConfig)
          toast.success('Verification email sent! Please check your inbox.')
        } catch (fallbackError: unknown) {
          console.error('All email verification attempts failed:', fallbackError)
          const authError = fallbackError as { code?: string }
          if (authError.code === 'auth/too-many-requests') {
            toast.error('Too many requests. Please wait a moment before trying again.')
          } else {
            toast.error('Failed to send verification email. Please try again later or contact support.')
          }
        }
      }
    } finally {
      setSending(false)
    }
  }

  const handleGoToSignIn = () => {
    // Redirect to sign-in page with email pre-filled
    router.push(`/sign-in?email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/20">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-6 h-6 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Verify Your Email</h3>
      </div>
      
      <p className="text-gray-300 mb-4">
        We&apos;ve sent a verification email to <span className="font-medium text-blue-300">{email}</span>. 
        Please check your inbox and click the verification link to activate your account.
      </p>
      
      <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-200">
          💡 <strong>What happens next:</strong> After clicking the verification link in your email, 
          you&apos;ll be automatically redirected to the sign-in page where you can access your account.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleResendVerification}
          disabled={sending}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${sending ? 'animate-spin' : ''}`} />
          {sending ? 'Sending...' : 'Resend Email'}
        </Button>
        
        <Button
          onClick={handleGoToSignIn}
          className="bg-blue-600 hover:bg-blue-700"
        >
          I&apos;ve Verified My Email
        </Button>
      </div>
      
      <p className="text-sm text-gray-400 mt-4">
        Didn&apos;t receive the email? Check your spam folder or try resending.
      </p>
    </div>
  )
}

export default EmailVerification
