import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Mail, Lock, LogIn, Chrome, Sparkles } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    try {
      setError(''); setLoading(true)
      await login(email, password)
      navigate('/chat')
    } catch (err) {
      setError(getFirebaseErrorMessage(err.code))
    } finally { setLoading(false) }
  }

  async function handleGoogleLogin() {
    try {
      setError(''); setGoogleLoading(true)
      await loginWithGoogle()
      navigate('/chat')
    } catch (err) {
      setError(getFirebaseErrorMessage(err.code))
    } finally { setGoogleLoading(false) }
  }

  function getFirebaseErrorMessage(code) {
    switch (code) {
      case 'auth/user-not-found':     return 'No account found with this email.'
      case 'auth/wrong-password':     return 'Incorrect password.'
      case 'auth/invalid-email':      return 'Invalid email address.'
      case 'auth/too-many-requests':  return 'Too many attempts. Try again later.'
      case 'auth/invalid-credential': return 'Invalid email or password.'
      default:                        return 'Failed to sign in. Please try again.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-8 transition-colors duration-200">
      <div className="w-full max-w-sm sm:max-w-md">

        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-600 mb-3 shadow-lg">
            <Sparkles className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">DocCareAI</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl px-5 py-6 sm:p-8 border border-slate-200 dark:border-slate-700">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 sm:py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-medium text-base sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <LogIn className="w-4 h-4" />
              }
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                or continue with
              </span>
            </div>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-base sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-600 active:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            {googleLoading
              ? <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              : <Chrome className="w-4 h-4" />
            }
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
