import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, ChevronLeft } from 'lucide-react'
import { KanbanBoard } from '@/components/KanbanBoard'

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
    .select('*, projects(name), assigned:profiles!tasks_assigned_to_fkey(full_name)')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

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

      {!tasks || tasks.length === 0 ? (
        <div className="text-center py-20 bg-card/50 backdrop-blur-xl border border-dashed border-border rounded-3xl">
          <p className="text-foreground/50">No tasks found in this project. {isAdmin ? 'Add a task to get started!' : ''}</p>
        </div>
      ) : (
        <KanbanBoard 
          initialTasks={tasks} 
          isAdmin={isAdmin}
          members={members}
        />
      )}
    </div>
  )
}
