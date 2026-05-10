import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, ChevronLeft, Calendar, User } from 'lucide-react'
import { TaskStatusSelect } from '@/components/TaskStatusSelect'

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  const { data: project } = await supabase
    .from('projects')
    .select('*, profiles(full_name)')
    .eq('id', id)
    .single()

  if (!project) {
    redirect('/dashboard/projects')
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, assigned:profiles!tasks_assigned_to_fkey(full_name)')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1 text-sm text-foreground/50 hover:text-primary transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{project.name}</h1>
            <p className="text-sm text-foreground/70 mt-1 max-w-2xl">
              {project.description || 'No description provided.'}
            </p>
          </div>
          {isAdmin && (
            <Link
              href={`/dashboard/projects/${id}/tasks/new`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {!tasks || tasks.length === 0 ? (
          <div className="text-center py-20 bg-card/50 backdrop-blur-xl border border-dashed border-border rounded-3xl">
            <p className="text-foreground/50">No tasks found in this project. {isAdmin ? 'Add a task to get started!' : ''}</p>
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
                    projectId={id} 
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
                    <User className="w-3.5 h-3.5" />
                    <span>Assigned to: <span className="font-medium text-foreground/80">{task.assigned?.full_name || 'Unassigned'}</span></span>
                  </div>
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
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
