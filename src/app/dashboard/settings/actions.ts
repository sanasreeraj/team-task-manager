'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: { full_name?: string; phone_number?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Validate
  if (data.full_name !== undefined) {
    const name = data.full_name.trim()
    if (name.length < 2) return { error: 'Name must be at least 2 characters' }
    if (!/^[A-Za-z\s]+$/.test(name)) return { error: 'Name can only contain letters and spaces' }
    data.full_name = name
  }

  if (data.phone_number !== undefined) {
    const phone = data.phone_number.trim()
    if (phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
      return { error: 'Phone must be a valid 10-digit Indian number' }
    }
    data.phone_number = phone
  }

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  return { success: true }
}
