'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const adminCode = formData.get('admin_code') as string
  
  // Use environment variable or hardcoded fallback 'ADMIN123'
  const validAdminCode = process.env.ADMIN_ACCESS_CODE || 'ADMIN123'
  const role = adminCode === validAdminCode ? 'admin' : 'member'

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('full_name') as string,
        phone_number: formData.get('phone_number') as string,
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
