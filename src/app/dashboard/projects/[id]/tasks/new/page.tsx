import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { ChevronLeft, ChevronDown } from 'lucide-react'
import { getProjectMembers } from '../../member-actions'

export default async function NewTaskPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error: pageError } = await searchParams
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

  if (profile?.is_admin !== true) {
    redirect(`/dashboard/projects/${id}`)
  }

  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('id', id)
    .single()

  // Fetch only members assigned to this specific project
  const projectMembers = await getProjectMembers(id)
  const members = projectMembers.map((m: any) => ({ id: m.id, full_name: m.full_name }))

  async function createTask(formData: FormData) {
    'use server'
    const supabase = await createClient()

    const title = (formData.get('title') as string)?.trim()
    const description = (formData.get('description') as string)?.trim()
    const assigned_to = formData.get('assigned_to') as string
    const due_date = formData.get('due_date') as string
    const priority = formData.get('priority') as string
    const status = formData.get('status') as string

    if (!title || title.length < 1) {
      redirect(`/dashboard/projects/${id}/tasks/new?error=${encodeURIComponent('Task title is required')}`)
    }

    const { error } = await supabase.from('tasks').insert({
      project_id: id,
      title,
      description: description || null,
      assigned_to: assigned_to || null,
      due_date: due_date || null,
      priority: priority || 'medium',
      status: status || 'todo'
    })

    if (error) {
      redirect(`/dashboard/projects/${id}/tasks/new?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath(`/dashboard/projects/${id}`)
    redirect(`/dashboard/projects/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/dashboard/projects/${id}`}
          className="inline-flex items-center gap-1 text-sm text-foreground/50 hover:text-primary transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Project
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Add Task to {project?.name}</h1>
        <p className="text-sm text-foreground/70 mt-1">
          Assign a new task to your team member
        </p>
      </div>

      {pageError && (
        <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20 mb-6">
          <p className="text-sm text-red-500">{pageError}</p>
        </div>
      )}

      <form action={createTask} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground/90 mb-1.5">
              Task Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="block w-full rounded-xl border border-border bg-background py-3 px-4 text-foreground shadow-sm placeholder:text-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all sm:text-sm"
              placeholder="E.g., Design homepage mockup"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground/90 mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="block w-full rounded-xl border border-border bg-background py-3 px-4 text-foreground shadow-sm placeholder:text-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all sm:text-sm"
              placeholder="What needs to be done?"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="assigned_to" className="block text-sm font-medium text-foreground/90 mb-1.5">
                Assign To
              </label>
              <div className="relative">
                <select
                  id="assigned_to"
                  name="assigned_to"
                  className="block w-full rounded-xl border border-border bg-background py-3 pl-4 pr-10 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all sm:text-sm appearance-none"
                >
                  <option value="">Unassigned</option>
                  {members?.map(member => (
                    <option key={member.id} value={member.id}>{member.full_name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 pointer-events-none" />
              </div>
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-foreground/90 mb-1.5">
                Priority
              </label>
              <div className="relative">
                <select
                  id="priority"
                  name="priority"
                  defaultValue="medium"
                  className="block w-full rounded-xl border border-border bg-background py-3 pl-4 pr-10 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all sm:text-sm appearance-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-foreground/90 mb-1.5">
                Initial Status
              </label>
              <div className="relative">
                <select
                  id="status"
                  name="status"
                  defaultValue="todo"
                  className="block w-full rounded-xl border border-border bg-background py-3 pl-4 pr-10 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all sm:text-sm appearance-none"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="code_review">Code Review</option>
                  <option value="done">Done</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 pointer-events-none" />
              </div>
            </div>
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-foreground/90 mb-1.5">
                Due Date
              </label>
              <input
                id="due_date"
                name="due_date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="block w-full rounded-xl border border-border bg-background py-3 px-4 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-95"
          >
            Add Task
          </button>
          <Link
            href={`/dashboard/projects/${id}`}
            className="flex-1 text-center rounded-xl border border-border bg-card/50 px-4 py-3 text-sm font-semibold text-foreground hover:bg-card transition-all active:scale-95"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
