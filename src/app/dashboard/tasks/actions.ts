'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateTaskStatus(taskId: string, projectId: string, newStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const validStatuses = ['todo', 'in_progress', 'code_review', 'done']
  if (!validStatuses.includes(newStatus)) return { error: 'Invalid status' }

  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', taskId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateTask(
  taskId: string, 
  projectId: string, 
  data: { 
    title?: string
    description?: string
    priority?: string
    feedback?: string
    assigned_to?: string | null
    due_date?: string | null
    status?: string
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Validate priority if provided
  if (data.priority && !['low', 'medium', 'high', 'urgent'].includes(data.priority)) {
    return { error: 'Invalid priority' }
  }

  // Validate title
  if (data.title !== undefined && data.title.trim().length === 0) {
    return { error: 'Title cannot be empty' }
  }

  const { error } = await supabase
    .from('tasks')
    .update(data)
    .eq('id', taskId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteTask(taskId: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify admin role
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (profile?.is_admin !== true) return { error: 'Only admins can delete tasks' }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard')
  return { success: true }
}
