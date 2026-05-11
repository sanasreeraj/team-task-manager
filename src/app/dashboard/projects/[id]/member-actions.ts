'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Use admin client for bypassing RLS securely
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function addProjectMember(projectId: string, userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (profile?.is_admin !== true) return { error: 'Unauthorized' }

  const adminClient = getAdminClient()
  const { error } = await adminClient
    .from('project_members')
    .insert({ project_id: projectId, user_id: userId })

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}

export async function removeProjectMember(projectId: string, userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (profile?.is_admin !== true) return { error: 'Unauthorized' }
  
  const adminClient = getAdminClient()
  const { error } = await adminClient
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId)

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}

export async function getProjectMembers(projectId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('project_members')
    .select('user_id, profiles(id, full_name, role)')
    .eq('project_id', projectId)

  if (error) {
    console.error(error)
    return []
  }

  return (data?.map(item => Array.isArray(item.profiles) ? item.profiles[0] : item.profiles).filter(Boolean) || []) as any[]
}
