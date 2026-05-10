import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FolderKanban, ListChecks, CheckCircle2, Clock, AlertTriangle, Calendar, ArrowRight } from 'lucide-react'

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

  // Time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Fetch Stats
  let projectCount = 0
  let taskCount = 0
  let completedTasks = 0
  let pendingTasks = 0
  let overdueTasks = 0
  let overdueTaskList: any[] = []
  let recentTasks: any[] = []
  let statusCounts = { todo: 0, in_progress: 0, code_review: 0, done: 0 }

  const now = new Date().toISOString().split('T')[0]

  if (isAdmin) {
    const { count: pCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.id)
    
    const { data: allTasks } = await supabase
      .from('tasks')
      .select('*, projects!inner(name, created_by), assigned:profiles!tasks_assigned_to_fkey(full_name)')
      .eq('projects.created_by', user.id)

    projectCount = pCount || 0
    taskCount = allTasks?.length || 0
    completedTasks = allTasks?.filter(t => t.status === 'done').length || 0
    pendingTasks = allTasks?.filter(t => t.status !== 'done').length || 0
    overdueTasks = allTasks?.filter(t => t.status !== 'done' && t.due_date && t.due_date < now).length || 0
    
    // Status distribution
    allTasks?.forEach(t => {
      if (t.status in statusCounts) statusCounts[t.status as keyof typeof statusCounts]++
    })

    overdueTaskList = (allTasks || [])
      .filter(t => t.status !== 'done' && t.due_date && t.due_date < now)
      .sort((a, b) => a.due_date!.localeCompare(b.due_date!))
      .slice(0, 5)
    
    recentTasks = (allTasks || [])
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 5)
  } else {
    const { data: myTasks } = await supabase
      .from('tasks')
      .select('*, projects(name), assigned:profiles!tasks_assigned_to_fkey(full_name)')
      .eq('assigned_to', user.id)

    taskCount = myTasks?.length || 0
    completedTasks = myTasks?.filter(t => t.status === 'done').length || 0
    pendingTasks = myTasks?.filter(t => t.status !== 'done').length || 0
    overdueTasks = myTasks?.filter(t => t.status !== 'done' && t.due_date && t.due_date < now).length || 0
    projectCount = new Set(myTasks?.map(t => t.project_id)).size

    myTasks?.forEach(t => {
      if (t.status in statusCounts) statusCounts[t.status as keyof typeof statusCounts]++
    })

    overdueTaskList = (myTasks || [])
      .filter(t => t.status !== 'done' && t.due_date && t.due_date < now)
      .sort((a, b) => a.due_date!.localeCompare(b.due_date!))
      .slice(0, 5)
    
    recentTasks = (myTasks || [])
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 5)
  }

  const completionPercent = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0

  const priorityLabel = (p: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-500/10 text-red-500',
      high: 'bg-orange-500/10 text-orange-500',
      medium: 'bg-yellow-500/10 text-yellow-600',
      low: 'bg-green-500/10 text-green-500',
    }
    return colors[p] || colors.medium
  }

  const statusLabel = (s: string) => {
    const colors: Record<string, string> = {
      done: 'bg-green-500/10 text-green-600',
      in_progress: 'bg-blue-500/10 text-blue-600',
      code_review: 'bg-purple-500/10 text-purple-600',
      todo: 'bg-orange-500/10 text-orange-600',
    }
    return colors[s] || colors.todo
  }

  // Chart data
  const chartItems = [
    { label: 'To Do', count: statusCounts.todo, color: '#f97316' },
    { label: 'In Progress', count: statusCounts.in_progress, color: '#3b82f6' },
    { label: 'Code Review', count: statusCounts.code_review, color: '#a855f7' },
    { label: 'Done', count: statusCounts.done, color: '#22c55e' },
  ]

  return (
    <div>
      {/* Welcome Banner */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          {greeting}, {profile?.full_name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-sm text-foreground/50 mt-1">
          {isAdmin ? 'Here\'s your team\'s progress overview' : 'Here\'s what\'s on your plate today'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mb-8">
        <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FolderKanban className="w-4 h-4 text-foreground/40" />
            <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider">Projects</p>
          </div>
          <p className="text-2xl font-semibold text-foreground">{projectCount}</p>
        </div>
        <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="w-4 h-4 text-foreground/40" />
            <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider">Total Tasks</p>
          </div>
          <p className="text-2xl font-semibold text-foreground">{taskCount}</p>
        </div>
        <div className="rounded-2xl bg-green-500/5 border border-green-500/20 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-500/60" />
            <p className="text-[10px] font-semibold text-green-600/60 uppercase tracking-wider">Completed</p>
          </div>
          <p className="text-2xl font-semibold text-green-600">{completedTasks}</p>
        </div>
        <div className="rounded-2xl bg-orange-500/5 border border-orange-500/20 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-orange-500/60" />
            <p className="text-[10px] font-semibold text-orange-600/60 uppercase tracking-wider">Pending</p>
          </div>
          <p className="text-2xl font-semibold text-orange-600">{pendingTasks}</p>
        </div>
        <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500/60" />
            <p className="text-[10px] font-semibold text-red-600/60 uppercase tracking-wider">Overdue</p>
          </div>
          <p className="text-2xl font-semibold text-red-600">{overdueTasks}</p>
        </div>
      </div>

      {/* Progress Bar + Status Distribution */}
      {taskCount > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-4 mb-8">
          <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground/70">Overall Completion</p>
              <p className="text-sm font-semibold text-foreground">{completionPercent}%</p>
            </div>
            <div className="w-full h-2 bg-foreground/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          {/* Status Distribution Bar Chart */}
          <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-5 shadow-sm">
            <p className="text-xs font-semibold text-foreground/50 mb-3">Task Distribution</p>
            <div className="space-y-2">
              {chartItems.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-foreground/40 w-20 shrink-0 truncate">{item.label}</span>
                  <div className="flex-1 h-2 bg-foreground/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${taskCount > 0 ? (item.count / taskCount) * 100 : 0}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-foreground/40 w-5 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Two-column layout for overdue + recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Tasks */}
        <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
            <h2 className="text-sm font-semibold text-foreground">Overdue Tasks</h2>
            <Link href="/dashboard/tasks" className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/20">
            {overdueTaskList.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500/30 mx-auto mb-2" />
                <p className="text-sm text-foreground/40">No overdue tasks — great job!</p>
              </div>
            ) : (
              overdueTaskList.map(task => (
                <Link key={task.id} href={`/dashboard/projects/${task.project_id}`} className="px-5 py-3.5 flex items-center justify-between hover:bg-foreground/[0.02] transition-colors block">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    <p className="text-[10px] text-foreground/40 mt-0.5">{task.projects?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${priorityLabel(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
            <h2 className="text-sm font-semibold text-foreground">Recent Tasks</h2>
            <Link href="/dashboard/tasks" className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/20">
            {recentTasks.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <ListChecks className="w-8 h-8 text-foreground/10 mx-auto mb-2" />
                <p className="text-sm text-foreground/40">No tasks yet</p>
              </div>
            ) : (
              recentTasks.map(task => (
                <Link key={task.id} href={`/dashboard/projects/${task.project_id}`} className="px-5 py-3.5 flex items-center justify-between hover:bg-foreground/[0.02] transition-colors block">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    <p className="text-[10px] text-foreground/40 mt-0.5">{task.projects?.name}</p>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0 ml-3 ${statusLabel(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
