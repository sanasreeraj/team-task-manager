import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
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
    redirect('/dashboard/projects')
  }

  async function createProject(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const name = (formData.get('name') as string)?.trim()
    const description = (formData.get('description') as string)?.trim()

    if (!name || name.length < 1) {
      redirect('/dashboard/projects/new?error=' + encodeURIComponent('Project name is required'))
    }

    const { error } = await supabase.from('projects').insert({
      name,
      description: description || null,
      created_by: user.id,
    })

    if (error) {
      redirect('/dashboard/projects/new?error=' + encodeURIComponent(error.message))
    }

    revalidatePath('/dashboard/projects')
    redirect('/dashboard/projects')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Create New Project</h1>
        <p className="text-sm text-foreground/70 mt-1">
          Start a new project and organize your team tasks
        </p>
      </div>

      {pageError && (
        <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20 mb-6">
          <p className="text-sm text-red-500">{pageError}</p>
        </div>
      )}

      <form action={createProject} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground/90 mb-1.5">
              Project Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="block w-full rounded-xl border border-border bg-background py-3 px-4 text-foreground shadow-sm placeholder:text-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all sm:text-sm"
              placeholder="E.g., Q3 Marketing Campaign"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground/90 mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="block w-full rounded-xl border border-border bg-background py-3 px-4 text-foreground shadow-sm placeholder:text-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all sm:text-sm"
              placeholder="Describe the goals and scope of this project..."
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-95"
          >
            Create Project
          </button>
          <a
            href="/dashboard/projects"
            className="flex-1 text-center rounded-xl border border-border bg-card/50 px-4 py-3 text-sm font-semibold text-foreground hover:bg-card transition-all active:scale-95"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
