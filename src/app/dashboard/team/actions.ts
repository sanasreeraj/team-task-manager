'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteMember(memberId: string) {
  const supabase = await createClient()
  
  // First check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  // Delete from profiles (auth.users deletion requires service role, so we just delete profile)
  // Actually, we can just delete the profile. The user can still log in but will have no profile.
  // In a real app, you'd use the Supabase Admin API to delete the auth user.
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', memberId)

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/team')
  return { success: true }
}
