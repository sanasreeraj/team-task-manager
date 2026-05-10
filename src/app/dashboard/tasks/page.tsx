import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { KanbanBoard } from '@/components/KanbanBoard'

export default async function TaskBoardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Admin: show ALL tasks from all projects they own
  // Member: show tasks assigned to them
  let query = supabase
    .from('tasks')
    .select('*, projects(name), assigned:profiles!tasks_assigned_to_fkey(full_name)')
    .order('created_at', { ascending: false })

  if (!isAdmin) {
    query = query.eq('assigned_to', user.id)
  }

  const { data: tasks } = await query

  let members: { id: string; full_name: string }[] = []
  if (isAdmin) {
    const { data } = await supabase.from('profiles').select('id, full_name')
    members = data || []
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">{isAdmin ? 'Task Board' : 'My Tasks'}</h1>
        <p className="text-sm text-foreground/50 mt-1">
          {isAdmin ? 'All tasks across every project' : 'Drag tasks to update their progress'}
        </p>
      </div>
      <KanbanBoard initialTasks={tasks || []} isAdmin={isAdmin} members={members} />
    </div>
  )
}
