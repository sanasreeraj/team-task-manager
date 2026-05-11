import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, ChevronLeft, ListChecks, Eye } from 'lucide-react'
import { KanbanBoard } from '@/components/KanbanBoard'
import { DeleteProjectButton } from '@/components/DeleteProjectButton'
import { ProjectMembers } from '@/components/ProjectMembers'
import { EditableProjectHeader } from '@/components/EditableProjectHeader'
import { getProjectMembers } from './member-actions'

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
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.is_admin === true

  const { data: project } = await supabase
    .from('projects')
    .select('*, profiles(full_name)')
    .eq('id', id)
    .single()

  if (!project) {
    redirect('/dashboard/projects')
  }

  // Fetch project members
  const projectMembers = await getProjectMembers(id)
  
  // Fetch all profiles for admin to add members
  let allProfiles: any[] = []
  if (isAdmin) {
    const { data } = await supabase.from('profiles').select('id, full_name, role')
    allProfiles = data || []
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, projects(name), assigned:profiles!tasks_assigned_to_fkey(full_name)')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  // Task stats
  const total = tasks?.length || 0
  const todo = tasks?.filter(t => t.status === 'todo').length || 0
  const inProgress = tasks?.filter(t => t.status === 'in_progress').length || 0
  const codeReview = tasks?.filter(t => t.status === 'code_review').length || 0
  const done = tasks?.filter(t => t.status === 'done').length || 0

  // Build members list for KanbanBoard assignee dropdown
  // Use project members if any, otherwise fall back to all profiles
  const kanbanMembers = projectMembers.length > 0
    ? projectMembers.map((m: any) => ({ id: m.id, full_name: m.full_name }))
    : allProfiles.map(p => ({ id: p.id, full_name: p.full_name }))

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1 text-xs text-foreground/40 hover:text-primary transition-colors mb-4"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Projects
        </Link>
        <div className="flex items-start justify-between">
          <EditableProjectHeader
            projectId={id}
            name={project.name}
            description={project.description}
            isAdmin={isAdmin}
          />
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <>
                <Link
                  href={`/dashboard/projects/${id}/tasks/new`}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </Link>
                <DeleteProjectButton projectId={id} projectName={project.name} />
              </>
            )}
          </div>
        </div>

        {/* Task Stats Bar */}
        {total > 0 && (
          <div className="mt-6 flex items-center gap-6 text-xs text-foreground/50">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500/60" />
              To Do {todo}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500/60" />
              In Progress {inProgress}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500/60" />
              Review {codeReview}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500/60" />
              Done {done}
            </span>
            <span className="ml-auto font-medium text-foreground/70">{total} total</span>
          </div>
        )}
      </div>

      <ProjectMembers 
        projectId={id}
        currentMembers={projectMembers}
        allProfiles={allProfiles}
        isAdmin={isAdmin}
      />

      <div className="mt-10">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-foreground/40" />
          Task Board
        </h2>
        {!tasks || tasks.length === 0 ? (
          <div className="text-center py-20 bg-card/50 backdrop-blur-xl border border-dashed border-border rounded-3xl">
            <ListChecks className="w-10 h-10 text-foreground/10 mx-auto mb-3" />
            <p className="text-foreground/40 text-sm">{isAdmin ? 'Add your first task to get started' : 'No tasks in this project'}</p>
          </div>
        ) : (
          <KanbanBoard
            initialTasks={tasks}
            isAdmin={isAdmin}
            members={kanbanMembers} 
          />
        )}
      </div>
    </div>
  )
}
