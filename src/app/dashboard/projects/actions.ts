'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

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
