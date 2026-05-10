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
  let completedTasks = 0
  let pendingTasks = 0
  let overdueTasks = 0

  const now = new Date().toISOString().split('T')[0]

  if (isAdmin) {
    // Admin stats - Total for all projects they created
    const { count: pCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.id)
    
    const { data: allTasks } = await supabase
      .from('tasks')
      .select('status, due_date, projects!inner(created_by)')
      .eq('projects.created_by', user.id)

    projectCount = pCount || 0
    taskCount = allTasks?.length || 0
    completedTasks = allTasks?.filter(t => t.status === 'done').length || 0
    pendingTasks = allTasks?.filter(t => t.status !== 'done').length || 0
    overdueTasks = allTasks?.filter(t => t.status !== 'done' && t.due_date && t.due_date < now).length || 0
  } else {
    // Member stats - Only for tasks assigned to them
    const { data: myTasks } = await supabase
      .from('tasks')
      .select('status, due_date, project_id')
      .eq('assigned_to', user.id)

    taskCount = myTasks?.length || 0
    completedTasks = myTasks?.filter(t => t.status === 'done').length || 0
    pendingTasks = myTasks?.filter(t => t.status !== 'done').length || 0
    overdueTasks = myTasks?.filter(t => t.status !== 'done' && t.due_date && t.due_date < now).length || 0
    
    // Unique projects they have tasks in
    projectCount = new Set(myTasks?.map(t => t.project_id)).size
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          {isAdmin ? 'Admin Overview' : 'Personal Dashboard'}
        </h1>
        <p className="text-sm text-foreground/70 mt-1">
          {isAdmin ? 'Monitoring team progress and project health' : 'Track your assigned tasks and deadlines'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 shadow-sm transition-all hover:shadow-md">
          <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">Total Projects</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{projectCount}</p>
        </div>
        <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 shadow-sm transition-all hover:shadow-md">
          <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">Total Tasks</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{taskCount}</p>
        </div>
        <div className="rounded-2xl bg-green-500/5 backdrop-blur-xl border border-green-500/20 p-6 shadow-sm transition-all hover:shadow-md">
          <p className="text-xs font-medium text-green-600/70 uppercase tracking-wider">Completed</p>
          <p className="mt-2 text-3xl font-semibold text-green-600">{completedTasks}</p>
        </div>
        <div className="rounded-2xl bg-orange-500/5 backdrop-blur-xl border border-orange-500/20 p-6 shadow-sm transition-all hover:shadow-md">
          <p className="text-xs font-medium text-orange-600/70 uppercase tracking-wider">Pending</p>
          <p className="mt-2 text-3xl font-semibold text-orange-600">{pendingTasks}</p>
        </div>
        <div className="rounded-2xl bg-red-500/5 backdrop-blur-xl border border-red-500/20 p-6 shadow-sm transition-all hover:shadow-md">
          <p className="text-xs font-medium text-red-600/70 uppercase tracking-wider">Overdue</p>
          <p className="mt-2 text-3xl font-semibold text-red-600">{overdueTasks}</p>
        </div>
      </div>

      {isAdmin ? (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground">Recent Team Activity</h2>
          <div className="rounded-3xl bg-card/50 border border-dashed border-border p-12 text-center">
            <p className="text-foreground/50 text-sm">Activity feed coming soon...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground">My Priority Tasks</h2>
          <div className="rounded-3xl bg-card/50 border border-dashed border-border p-12 text-center">
            <p className="text-foreground/50 text-sm">No priority tasks set.</p>
          </div>
        </div>
      )}
    </div>
  )
}
