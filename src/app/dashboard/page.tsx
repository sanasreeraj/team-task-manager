import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Fetch Stats
  let projectCount = 0
  let taskCount = 0
  let pendingTasks = 0

  if (isAdmin) {
    // Admin stats
    const { count: pCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.id)
    
    const { count: tCount } = await supabase
      .from('tasks')
      .select('*, projects!inner(*)', { count: 'exact', head: true })
      .eq('projects.created_by', user.id)

    projectCount = pCount || 0
    taskCount = tCount || 0
  } else {
    // Member stats
    const { count: tCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', user.id)
    
    const { count: pCount } = await supabase
      .from('tasks')
      .select('project_id', { count: 'exact', head: true })
      .eq('assigned_to', user.id)

    taskCount = tCount || 0
    projectCount = pCount || 0 // Rough estimate of projects they have tasks in
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
        </h1>
        <p className="text-sm text-foreground/70 mt-1">
          Welcome back, {profile?.full_name || 'User'}!
        </p>
      </div>

      {isAdmin ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-primary/5 backdrop-blur-xl border border-primary/20 p-6 shadow-sm transition-all hover:shadow-md">
            <p className="text-sm font-medium text-primary">Team Projects</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{projectCount}</p>
          </div>
          <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 shadow-sm transition-all hover:shadow-md">
            <p className="text-sm font-medium text-foreground/70">Total Team Tasks</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{taskCount}</p>
          </div>
          <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 shadow-sm transition-all hover:shadow-md">
            <p className="text-sm font-medium text-foreground/70">Team Performance</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">--</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-primary/5 backdrop-blur-xl border border-primary/20 p-6 shadow-sm transition-all hover:shadow-md">
            <p className="text-sm font-medium text-primary">Assigned Tasks</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{taskCount}</p>
          </div>
          <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 shadow-sm transition-all hover:shadow-md">
            <p className="text-sm font-medium text-foreground/70">Active Projects</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{projectCount}</p>
          </div>
          <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 shadow-sm transition-all hover:shadow-md">
            <p className="text-sm font-medium text-foreground/70">Upcoming Deadlines</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">0</p>
          </div>
        </div>
      )}
    </div>
  )
}
