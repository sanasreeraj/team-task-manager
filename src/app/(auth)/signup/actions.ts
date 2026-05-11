'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

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
  const is_admin = adminCode === process.env.ADMIN_ACCESS_CODE
  if (adminCode && !is_admin) {
    return redirect('/signup?error=' + encodeURIComponent('Invalid Admin Access Code'))
  }

  const data = {
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
        role: 'Member',
        is_admin,
        email,
      }
    }
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/signup?error=' + encodeURIComponent(error.message))
  }

  if (authData.user) {
    // Manually ensure email is populated in the profile in case the Postgres trigger misses it
    const adminClient = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    await adminClient.from('profiles').update({ email }).eq('id', authData.user.id)
  }

  if (!authData.session) {
    redirect('/signup?message=Please check your email to verify your account.')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
