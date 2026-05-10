'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addComment(taskId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('task_comments').insert({
    task_id: taskId,
    user_id: user.id,
    content,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/tasks')
  return { success: true }
}

export async function getComments(taskId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('task_comments')
    .select('*, profiles(full_name)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  if (error) return { error: error.message, data: [] }
  return { data: data || [] }
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('task_comments')
    .delete()
    .eq('id', commentId)

  if (error) return { error: error.message }
  return { success: true }
}
