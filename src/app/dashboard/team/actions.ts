'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Use admin client for managing users (deleting/updating auth emails)
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function deleteMember(memberId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user?.id).single()
  if (profile?.is_admin !== true) return { error: 'Unauthorized' }

  const supabaseAdmin = getAdminClient()

  // Check target user to prevent deleting other admins
  const { data: targetProfile } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', memberId).single()
  if (targetProfile?.is_admin && user?.id !== memberId) {
    return { error: 'Cannot delete another admin' }
  }

  // Set their assigned tasks to unassigned first to prevent foreign key cascade issues
  await supabaseAdmin.from('tasks').update({ assigned_to: null }).eq('assigned_to', memberId)

  // Delete from auth.users (cascades down to profiles)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(memberId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/team')
  return { success: true }
}

export async function updateMemberDetails(memberId: string, data: { full_name: string; phone_number: string; email: string; role: string; is_admin?: boolean }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user?.id).single()
  if (profile?.is_admin !== true) return { error: 'Unauthorized' }

  const supabaseAdmin = getAdminClient()

  // Prevent editing other admins
  const { data: targetProfile } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', memberId).single()
  if (targetProfile?.is_admin && user?.id !== memberId) {
    return { error: 'Cannot edit another admin' }
  }

  // Update profile data
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ 
      full_name: data.full_name, 
      phone_number: data.phone_number, 
      email: data.email,
      role: data.role,
      ...(data.is_admin !== undefined ? { is_admin: data.is_admin } : {})
    })
    .eq('id', memberId)

  if (profileError) return { error: profileError.message }

  // Update login email in Auth
  if (data.email) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(memberId, { email: data.email })
    if (authError) return { error: authError.message }
  }

  revalidatePath('/dashboard/team')
  return { success: true }
}
