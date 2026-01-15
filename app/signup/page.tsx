'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { Mail, Lock, User, Shield, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

import { GoogleOAuthProvider, googleLogout, useGoogleLogin } from '@react-oauth/google'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    googleLogout()
    const token = searchParams.get('invite')
    if (token) {
      setInviteToken(token)
    }
  }, [])

  function GoogleButton({ onSuccess, onError }: { onSuccess: (tokenResponse: any) => void; onError: () => void }) {
    const loginWithGoogle = useGoogleLogin({ onSuccess, onError })
    return (
      <button
        type="button"
        onClick={() => loginWithGoogle()}
        className="w-full inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl bg-white text-dark-darker font-bold transition-all duration-200 hover:bg-gray-100 hover:scale-[1.02] shadow-lg shadow-white/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.9 0-12.5-5.6-12.5-12.5S17.1 11 24 11c3.2 0 6.1 1.2 8.3 3.2l5.7-5.7C34.6 5 29.6 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21c10.5 0 19.4-7.6 21-17.5.2-1.3.3-2.6.3-4z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.8 16.2 19.1 13 24 13c3.2 0 6.1 1.2 8.3 3.2l5.7-5.7C34.6 5 29.6 3 24 3 16.3 3 9.6 7.1 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 45c5.4 0 10.4-2.1 14.1-5.6l-6.6-5.4c-2.2 1.5-4.9 2.4-7.6 2.4-5.3 0-9.8-3.4-11.4-8.1l-6.7 5.2C9.6 40.9 16.3 45 24 45z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.4 5.8-6.3 7.4l6.6 5.4C39.4 37.9 42.8 31.6 43.6 24c.2-1.3.3-2.6.3-4z" />
        </svg>
        <span>Continue with Google</span>
      </button>
    )
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Google Auth Failed')

      if (data.needsPasswordSetup) {
        router.push('/set-password')
      } else {
        const role = (data?.user?.role || '').toLowerCase()
        if (role === 'admin') {
          router.push('/admin/dashboard')
        } else if (role === 'beneficiary') {
          router.push('/beneficiary-dashboard')
        } else if (role === 'vendor') {
          router.push('/vendor-dashboard')
        } else {
          router.push('/donor-dashboard')
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google Signup Failed')
  }

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) return

    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          inviteToken,
        }),
      })

      // Check content type
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text()
        console.error('Non-JSON response:', text)
        throw new Error('Server returned an error (check logs)')
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      if (data?.user?.role) {
        const role = (data.user.role || '').toLowerCase()
        if (role === 'admin') {
          router.push('/admin/dashboard')
          return
        } else if (role === 'beneficiary') {
          router.push('/beneficiary-dashboard')
          return
        } else {
          router.push('/donor-dashboard')
          return
        }
      }
      setSuccess(data.message)
      setFormData({ name: '', email: '', password: '', confirmPassword: '' })
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (error) setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 p-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-block group">
            <h1 className="text-4xl font-black tracking-tighter text-white mb-2 group-hover:scale-105 transition-transform">
              SALVUS<span className="text-accent">.</span>
            </h1>
          </Link>
          <p className="text-gray-400">Join the secure relief network.</p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl"
        >
          {!success && (
            <>
              {/* Google Signup */}
              <div className="mb-8">
                <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
                  <GoogleButton
                    onSuccess={async (tokenResponse: any) => {
                      setLoading(true)
                      setError('')
                      try {
                        const res = await fetch('/api/auth/google', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ access_token: tokenResponse.access_token }),
                        })
                        const data = await res.json()
                        if (!res.ok) throw new Error(data.message || 'Google Auth Failed')
                        if (data.needsPasswordSetup) {
                          router.push('/set-password')
                        } else {
                          const role = (data?.user?.role || '').toLowerCase()
                          if (role === 'admin') {
                            router.push('/admin/dashboard')
                          } else if (role === 'beneficiary') {
                            router.push('/beneficiary-dashboard')
                          } else {
                            router.push('/donor-dashboard')
                          }
                        }
                      } catch (err: any) {
                        setError(err.message)
                      } finally {
                        setLoading(false)
                      }
                    }}
                    onError={() => setError('Google Signup Failed')}
                  />
                </GoogleOAuthProvider>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="h-px flex-1 bg-white/10"></div>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">or sign up with email</span>
                  <div className="h-px flex-1 bg-white/10"></div>
                </div>
              </div>
            </>
          )}

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-green-500/30">
                <Shield className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Check Your Email</h3>
              <p className="text-gray-400 mb-8 leading-relaxed max-w-[280px] mx-auto">{success}</p>
              <Link href="/login" className="inline-flex items-center gap-2 text-accent hover:text-white font-bold transition-colors">
                Proceed to Login <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-accent transition-colors" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:bg-white/10 focus:ring-1 focus:ring-accent/50 transition-all"
                      placeholder="Full Name"
                    />
                  </div>
                </motion.div>

                <div>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-accent transition-colors" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:bg-white/10 focus:ring-1 focus:ring-accent/50 transition-all"
                      placeholder="Email Address"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-accent transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:bg-white/10 focus:ring-1 focus:ring-accent/50 transition-all"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-accent transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:bg-white/10 focus:ring-1 focus:ring-accent/50 transition-all"
                      placeholder="Confirm Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-accent hover:bg-accent-dark text-dark-darker font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-accent/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-gray-400 text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="text-accent hover:text-white font-semibold transition-colors">
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}
        </motion.div>

        <p className="text-center text-gray-600 text-xs mt-8">
          Protected by RECAPTCHA and the Google <a href="#" className="underline">Privacy Policy</a> and <a href="#" className="underline">Terms of Service</a> apply.
        </p>
      </div>
    </div>
  )
}
