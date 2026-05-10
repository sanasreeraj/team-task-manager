import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function ProjectsPage() {
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
    .from('projects')
    .select('*, profiles(full_name)')

  if (!isAdmin) {
    // If member, only show projects where they have at least one task assigned
    const { data: memberTasks } = await supabase
      .from('tasks')
      .select('project_id')
      .eq('assigned_to', user.id)
    
    const projectIds = Array.from(new Set(memberTasks?.map(t => t.project_id)))
    query = query.in('id', projectIds)
  }

  const { data: projects } = await query.order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
          <p className="text-sm text-foreground/70 mt-1">
            Manage and track all your team projects
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        )}
      </div>

      {!projects || projects.length === 0 ? (
        <div className="text-center py-20 bg-card/50 backdrop-blur-xl border border-dashed border-border rounded-3xl">
          <p className="text-foreground/50">No projects found. {isAdmin ? 'Create your first project to get started!' : ''}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="group rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
            >
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <p className="mt-2 text-sm text-foreground/70 line-clamp-2">
                {project.description || 'No description provided.'}
              </p>
              <div className="mt-6 flex items-center justify-between text-xs text-foreground/50">
                <span>By {project.profiles?.full_name || 'Unknown'}</span>
                <span>{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
