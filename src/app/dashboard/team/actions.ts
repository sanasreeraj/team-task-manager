'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteMember(memberId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const { error } = await supabase.from('profiles').delete().eq('id', memberId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/team')
  return { success: true }
}

export async function updateMemberDesignation(memberId: string, designation: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('profiles')
    .update({ designation })
    .eq('id', memberId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/team')
  return { success: true }
}
