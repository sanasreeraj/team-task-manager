'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateTaskStatus(taskId: string, projectId: string, newStatus: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', taskId)

  if (error) {
    console.error(error)
    return { error: error.message }
  }

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
  
  const { error } = await supabase
    .from('tasks')
    .update(data)
    .eq('id', taskId)

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteTask(taskId: string, projectId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard')
  return { success: true }
}
