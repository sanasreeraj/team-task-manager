import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, ListChecks, CheckCircle2, Users } from 'lucide-react'

export default async function ProjectsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  const isAdmin = profile?.is_admin === true

  let query = supabase
    .from('projects')
    .select('*, profiles(full_name)')

  if (!isAdmin) {
    const { data: memberTasks } = await supabase
      .from('tasks')
      .select('project_id')
      .eq('assigned_to', user.id)
    
    const projectIds = Array.from(new Set(memberTasks?.map(t => t.project_id)))
    if (projectIds.length === 0) {
      return (
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
              <p className="text-sm text-foreground/50 mt-1">Projects you are assigned to</p>
            </div>
          </div>
          <div className="text-center py-20 bg-card/50 backdrop-blur-xl border border-dashed border-border rounded-3xl">
            <p className="text-foreground/40">You have no projects assigned to you yet.</p>
          </div>
        </div>
      )
    }
    query = query.in('id', projectIds)
  }

  const { data: projects } = await query.order('created_at', { ascending: false })

  // Fetch task counts per project
  const projectIds = projects?.map(p => p.id) || []
  let taskCounts: Record<string, { total: number; done: number }> = {}
  let memberCounts: Record<string, number> = {}
  
  if (projectIds.length > 0) {
    const { data: allTasks } = await supabase
      .from('tasks')
      .select('project_id, status')
      .in('project_id', projectIds)
    
    allTasks?.forEach(t => {
      if (!taskCounts[t.project_id]) taskCounts[t.project_id] = { total: 0, done: 0 }
      taskCounts[t.project_id].total++
      if (t.status === 'done') taskCounts[t.project_id].done++
    })

    // Fetch member counts per project
    const { data: allMembers } = await supabase
      .from('project_members')
      .select('project_id')
      .in('project_id', projectIds)
    
    allMembers?.forEach(m => {
      memberCounts[m.project_id] = (memberCounts[m.project_id] || 0) + 1
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
          <p className="text-sm text-foreground/50 mt-1">
            {isAdmin ? 'Manage and track all your team projects' : 'Projects you are assigned to'}
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
          <p className="text-foreground/40">{isAdmin ? 'Create your first project to get started!' : 'No projects found.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const counts = taskCounts[project.id] || { total: 0, done: 0 }
            const mCount = memberCounts[project.id] || 0
            const pct = counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0

            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="group rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
              >
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {project.name}
                </h3>
                <p className="mt-1.5 text-xs text-foreground/50 line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>
                
                {/* Task + member stats */}
                <div className="mt-5 flex items-center gap-4 text-[10px] text-foreground/40">
                  <span className="flex items-center gap-1">
                    <ListChecks className="w-3 h-3" />
                    {counts.total} tasks
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500/60" />
                    {counts.done} done
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {mCount} members
                  </span>
                </div>

                {/* Progress bar */}
                {counts.total > 0 && (
                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-foreground/30 mt-1.5 text-right">{pct}% complete</p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-[10px] text-foreground/30">
                  <span>By {project.profiles?.full_name || 'Unknown'}</span>
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
