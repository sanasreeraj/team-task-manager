'use client'

import { forgotPassword } from './actions'
import { useState } from 'react'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateEmail = (val: string) => {
    setEmail(val)
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val) && val.length > 0) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }))
    } else {
      setErrors(prev => ({ ...prev, email: '' }))
    }
  }

  const hasErrors = Object.values(errors).some(err => err !== '') || !email

  return (
    <form className="mt-8 space-y-6" action={forgotPassword}>
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
      </div>

      <div>
        <button
          type="submit"
          disabled={hasErrors}
          className="flex w-full justify-center rounded-xl bg-primary px-3 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send Reset Link
        </button>
      </div>
    </form>
  )
}
