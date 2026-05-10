import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { KanbanBoard } from '@/components/KanbanBoard'

export default async function TasksPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  let query = supabase
    .from('tasks')
    .select('*, projects(name), assigned:profiles!tasks_assigned_to_fkey(full_name)')
    .order('created_at', { ascending: false })

  if (!isAdmin) {
    query = query.eq('assigned_to', user.id)
  }

  const { data: tasks } = await query

  // Get members for admin edit modal
  let members: { id: string; full_name: string }[] = []
  if (isAdmin) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
    members = data || []
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">{isAdmin ? 'Task Board' : 'My Tasks'}</h1>
        <p className="text-sm text-foreground/70 mt-1">
          {isAdmin ? 'Drag and drop tasks between columns to update status' : 'Drag tasks to update their progress'}
        </p>
      </div>

      <KanbanBoard 
        initialTasks={tasks || []} 
        isAdmin={isAdmin} 
        members={members}
      />
    </div>
  )
}
