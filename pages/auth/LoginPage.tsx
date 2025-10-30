import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { login, selectCurrentUser, selectAuthLoading, selectAuthError, clearError } from '../../state/authSlice'
import type { AppDispatch } from '../../state/store'

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>()
  const loading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)
  const me = useSelector(selectCurrentUser)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname ?? '/'

  // Redirect if already logged in
  useEffect(() => {
    if (me) {
      navigate(from, { replace: true })
    }
  }, [me, navigate, from])

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{email?: string; password?: string}>({})

  function validate() {
    const newErrors: typeof errors = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Enter a valid email'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Minimum 8 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!validate()) return
    
    dispatch(login({ 
      email: email.trim(), 
      passwordPlain: password, 
      remember 
    }))
  }

  // Handle Enter key submission
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      onSubmit()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="py-6 px-4 w-full">
        <div className="grid lg:grid-cols-2 items-center gap-6 max-w-6xl w-full mx-auto">
          {/* Form card */}
          <div className="border border-slate-300 rounded-lg p-6 max-w-md w-full shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] max-lg:mx-auto bg-white">
            <form className="space-y-6" onSubmit={onSubmit} noValidate>
              <div className="mb-6">
                <h1 className="text-slate-900 text-3xl font-semibold">Sign in</h1>
                <p className="text-slate-600 text-[15px] mt-3 leading-relaxed">
                  Sign in to your account to access the CRM.
                </p>
              </div>

              <div>
                <label className="text-slate-900 text-sm font-medium mb-2 block">Email</label>
                <div className="relative flex items-center">
                  <input
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    className={`w-full text-sm text-slate-900 border ${
                      errors.email ? 'border-red-400' : 'border-slate-300'
                    } pl-4 pr-10 py-3 rounded-lg outline-blue-600`}
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={onKeyDown}
                    disabled={loading}
                  />
                  {/* Email icon */}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="#bbb" 
                    className="w-[18px] h-[18px] absolute right-4" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M2 4h20v16H2z" fill="none"/>
                    <path d="M22 6v12H2V6l10 6L22 6z"/>
                  </svg>
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="text-slate-900 text-sm font-medium mb-2 block">Password</label>
                <div className="relative flex items-center">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className={`w-full text-sm text-slate-900 border ${
                      errors.password ? 'border-red-400' : 'border-slate-300'
                    } pl-4 pr-10 py-3 rounded-lg outline-blue-600`}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={onKeyDown}
                    disabled={loading}
                  />
                  {/* Eye toggle */}
                  <button 
                    type="button" 
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 text-lg"
                    disabled={loading}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <label className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    type="checkbox"
                    className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    disabled={loading}
                  />
                  <span className="ml-3 block text-sm text-slate-900">Remember me</span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Forgot your password?
                </Link>
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="!mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full shadow-xl py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
                <p className="text-sm !mt-6 text-center text-slate-600">
                  Don&apos;t have an account?{' '}
                  <span className="text-slate-500">Ask your administrator.</span>
                </p>
              </div>
            </form>
          </div>

          {/* Right image */}
          <div className="max-lg:mt-8">
            <img 
              src="https://readymadeui.com/login-image.webp"
              className="w-full aspect-[71/50] max-lg:w-4/5 mx-auto block object-cover rounded-lg"
              alt="login" 
            />
          </div>
        </div>
      </div>
    </div>
  )
}