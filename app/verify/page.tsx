'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || 'Verification failed')
        }

        setStatus('success')
        setMessage(data.message)
      } catch (err: any) {
        setStatus('error')
        setMessage(err.message)
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-dark-darker via-dark-darker to-dark px-6 py-12">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              SALVUS
            </h1>
          </Link>
        </div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-8 border border-dark-lighter/50 text-center"
        >
          {status === 'loading' && (
            <div className="py-8">
              <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Verifying Email...</h3>
              <p className="text-gray-400">Please wait while we verify your account.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Email Verified!</h3>
              <p className="text-gray-400 mb-6">{message}</p>
              <Link
                href="/login"
                className="inline-block w-full py-3.5 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-accent/20"
              >
                Proceed to Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-8">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Verification Failed</h3>
              <p className="text-gray-400 mb-6">{message}</p>
              <Link
                href="/login"
                className="text-accent hover:text-accent-light font-semibold"
              >
                Back to Login
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
