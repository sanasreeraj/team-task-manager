'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const fullName = (formData.get('full_name') as string)?.trim()
  const phoneNumber = (formData.get('phone_number') as string)?.trim()
  const adminCode = (formData.get('admin_code') as string)?.trim()

  // Server-side validation
  if (!fullName || fullName.length < 2) {
    redirect('/signup?error=' + encodeURIComponent('Full name must be at least 2 characters'))
  }

  if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    redirect('/signup?error=' + encodeURIComponent('Please enter a valid email address'))
  }

  if (!password || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
    redirect('/signup?error=' + encodeURIComponent('Password must be 8+ chars with uppercase, lowercase, number, and special character'))
  }

  if (!phoneNumber || phoneNumber.length !== 10 || !/^[6-9]/.test(phoneNumber)) {
    redirect('/signup?error=' + encodeURIComponent('Phone number must be a valid 10-digit Indian number'))
  }

  // Admin code — no hardcoded fallback, env var required
  const validAdminCode = process.env.ADMIN_ACCESS_CODE
  const role = (adminCode && validAdminCode && adminCode === validAdminCode) ? 'admin' : 'member'

  const data = {
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
        role: role,
      }
    }
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/signup?error=' + encodeURIComponent(error.message))
  }

  if (!authData.session) {
    redirect('/signup?message=Please check your email to verify your account.')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
