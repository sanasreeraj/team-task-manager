import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { TaskStatusSelect } from '@/components/TaskStatusSelect'
import { Calendar, FolderKanban } from 'lucide-react'

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
    .order('due_date', { ascending: true })

  // If not admin, only show tasks assigned to them
  if (!isAdmin) {
    query = query.eq('assigned_to', user.id)
  }

  const { data: tasks } = await query

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">{isAdmin ? 'All Team Tasks' : 'My Tasks'}</h1>
        <p className="text-sm text-foreground/70 mt-1">
          {isAdmin ? 'Monitor and manage all tasks across projects' : 'Track and update your assigned tasks'}
        </p>
      </div>

      {!tasks || tasks.length === 0 ? (
        <div className="text-center py-20 bg-card/50 backdrop-blur-xl border border-dashed border-border rounded-3xl">
          <p className="text-foreground/50">No tasks found. {isAdmin ? 'Create some projects and tasks to see them here.' : 'You have no tasks assigned to you.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="group rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <TaskStatusSelect 
                  taskId={task.id} 
                  projectId={task.project_id} 
                  initialStatus={task.status} 
                />
              </div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {task.title}
              </h3>
              <p className="mt-2 text-sm text-foreground/70 line-clamp-2">
                {task.description || 'No description.'}
              </p>
              
              <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>Project: <span className="font-medium text-foreground/80">{task.projects?.name}</span></span>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2 text-xs text-foreground/60">
                    <span className="font-medium text-foreground/80">Assigned to: {task.assigned?.full_name || 'Unassigned'}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Due: <span className="font-medium text-foreground/80">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
