'use client'

import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/firebase/client'
import { emailVerificationConfig } from '@/lib/email/config'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Mail, ArrowLeft } from 'lucide-react'
import { Input } from './ui/input'
import Link from 'next/link'

interface PasswordResetProps {
  onBack?: () => void
}

const PasswordReset = ({ onBack }: PasswordResetProps) => {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    setSending(true)
    try {
      await sendPasswordResetEmail(auth, email, {
        ...emailVerificationConfig,
        url: emailVerificationConfig.url.replace('/verify-email', '/sign-in')
      })
      setSent(true)
      toast.success('Password reset email sent! Please check your inbox.')
    } catch (error: unknown) {
      console.error('Error sending password reset email:', error)
      const authError = error as { code?: string }
      if (authError.code === 'auth/user-not-found') {
        toast.error('No account found with this email address.')
      } else if (authError.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.')
      } else if (authError.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Please wait a moment before trying again.')
      } else {
        toast.error('Failed to send password reset email. Please try again.')
      }
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6 border border-green-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Reset Email Sent</h3>
        </div>
        
        <p className="text-gray-300 mb-4">
          We&apos;ve sent a password reset link to <span className="font-medium text-green-300">{email}</span>. 
          Please check your inbox and follow the instructions to reset your password.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => setSent(false)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Send to Different Email
          </Button>
          
          <Link href="/sign-in">
            <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
              Back to Sign In
            </Button>
          </Link>
        </div>
        
        <p className="text-sm text-gray-400 mt-4">
          Didn&apos;t receive the email? Check your spam folder or try again.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl p-6 border border-orange-500/20">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-6 h-6 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">Reset Your Password</h3>
      </div>
      
        <p className="text-gray-300 mb-4">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>      <form onSubmit={handlePasswordReset} className="space-y-4">
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          required
        />
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            disabled={sending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {sending ? 'Sending...' : 'Send Reset Email'}
          </Button>
          
          {onBack && (
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default PasswordReset
