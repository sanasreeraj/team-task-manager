import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { KanbanBoard } from '@/components/KanbanBoard'

export default async function MyTasksPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (profile?.is_admin !== true) redirect('/dashboard/tasks')

  // Only tasks assigned TO the admin
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, projects(name), assigned:profiles!tasks_assigned_to_fkey(full_name)')
    .eq('assigned_to', user.id)
    .order('created_at', { ascending: false })

  const { data: members } = await supabase.from('profiles').select('id, full_name')

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">My Tasks</h1>
        <p className="text-sm text-foreground/50 mt-1">Tasks assigned specifically to you</p>
      </div>
      <KanbanBoard initialTasks={tasks || []} isAdmin={true} members={members || []} />
    </div>
  )
}
