'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (profile?.is_admin !== true) return { error: 'Unauthorized' }

  // Tasks cascade-delete via SQL FK constraint
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard')
  redirect('/dashboard/projects')
}

export async function updateProject(projectId: string, data: { name?: string; description?: string }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (profile?.is_admin !== true) return { error: 'Unauthorized' }

  if (data.name !== undefined && data.name.trim().length === 0) {
    return { error: 'Project name cannot be empty' }
  }

  const { error } = await supabase
    .from('projects')
    .update(data)
    .eq('id', projectId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath('/dashboard/projects')
  return { success: true }
}
