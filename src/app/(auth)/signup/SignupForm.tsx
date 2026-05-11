'use client'

import { signup } from './actions'
import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function SignupForm() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateName = (val: string) => {
    // Only allow alphabets and spaces
    const alphabetsOnly = val.replace(/[^A-Za-z\s]/g, '')
    setName(alphabetsOnly)
    setErrors(prev => ({ ...prev, name: '' }))
  }

  const validatePhone = (val: string) => {
    // Only allow numbers
    const numbersOnly = val.replace(/[^0-9]/g, '')
    // Max 10 digits
    const truncated = numbersOnly.slice(0, 10)
    setPhone(truncated)
    
    if (truncated.length > 0 && !/^[6-9]/.test(truncated)) {
      setErrors(prev => ({ ...prev, phone: 'Phone number must start with 6, 7, 8, or 9' }))
    } else if (truncated.length > 0 && truncated.length < 10) {
      setErrors(prev => ({ ...prev, phone: 'Phone number must be exactly 10 digits' }))
    } else {
      setErrors(prev => ({ ...prev, phone: '' }))
    }
  }

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

  const hasErrors = Object.values(errors).some(err => err !== '') || !name || phone.length < 10 || !email || !password

  return (
    <form className="mt-8 space-y-6" action={signup}>
      <div className="space-y-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-foreground/90 mb-1.5">
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => validateName(e.target.value)}
            className={`block w-full rounded-xl border ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary focus:border-primary'} bg-background py-3 px-4 text-foreground shadow-sm placeholder:text-foreground/40 focus:ring-1 focus:outline-none transition-all sm:text-sm`}
            placeholder="Sana Sreeraj"
          />
          {errors.name && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.name}</p>}
        </div>
        
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-foreground/90 mb-1.5">
            Phone Number
          </label>
          <div className={`flex rounded-xl border ${errors.phone ? 'border-red-500 focus-within:ring-red-500' : 'border-border focus-within:border-primary focus-within:ring-primary'} shadow-sm focus-within:ring-1 transition-all`}>
            <span className="flex items-center pl-4 pr-2 text-foreground/70 bg-background rounded-l-xl">
              +91
            </span>
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              required
              value={phone}
              onChange={(e) => validatePhone(e.target.value)}
              className="block w-full border-0 bg-background py-3 pr-4 pl-1 text-foreground placeholder:text-foreground/40 focus:ring-0 sm:text-sm rounded-r-xl"
              placeholder="9876543210"
            />
          </div>
          {errors.phone && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.phone}</p>}
        </div>

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
          <label htmlFor="password" className="block text-sm font-medium text-foreground/90 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
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
        
        <div>
          <label htmlFor="admin_code" className="block text-sm font-medium text-foreground/90 mb-1.5">
            Admin Access Code <span className="text-foreground/50 font-normal">(Optional)</span>
          </label>
          <input
            id="admin_code"
            name="admin_code"
            type="text"
            className="block w-full rounded-xl border border-border bg-background py-3 px-4 text-foreground shadow-sm placeholder:text-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all sm:text-sm"
            placeholder="Leave blank if you are a member"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={hasErrors}
          className="flex w-full justify-center rounded-xl bg-primary px-3 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sign up
        </button>
      </div>
    </form>
  )
}
