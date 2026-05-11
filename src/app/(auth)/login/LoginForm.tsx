'use client'

import { login } from './actions'
import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateEmail = (val: string) => {
    setEmail(val)
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val) && val.length > 0) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }))
    } else {
      setErrors(prev => ({ ...prev, email: '' }))
    }
  }

  const validatePassword = (val: string) => {
    setPassword(val)
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(val) && val.length > 0) {
      setErrors(prev => ({ ...prev, password: 'Must contain at least 8 chars (1 uppercase, 1 lowercase, 1 number, 1 special char)' }))
    } else {
      setErrors(prev => ({ ...prev, password: '' }))
    }
  }

  const hasErrors = Object.values(errors).some(err => err !== '') || !email || !password

  return (
    <form className="mt-8 space-y-6" action={login}>
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground/90 mb-1.5">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => validateEmail(e.target.value)}
            className={`block w-full rounded-xl border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary focus:border-primary'} bg-background py-3 px-4 text-foreground shadow-sm placeholder:text-foreground/40 focus:ring-1 focus:outline-none transition-all sm:text-sm`}
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.email}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-foreground/90">
              Password
            </label>
            <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => validatePassword(e.target.value)}
              className={`block w-full rounded-xl border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary focus:border-primary'} bg-background py-3 pl-4 pr-10 text-foreground shadow-sm placeholder:text-foreground/40 focus:ring-1 focus:outline-none transition-all sm:text-sm`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/50 hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.password}</p>}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={hasErrors}
          className="flex w-full justify-center rounded-xl bg-primary px-3 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sign in
        </button>
      </div>
    </form>
  )
}
