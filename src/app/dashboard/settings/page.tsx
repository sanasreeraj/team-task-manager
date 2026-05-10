import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-foreground/70 mt-1">
          Manage your account preferences and profile
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl bg-card/80 backdrop-blur-xl border border-border/50 p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/50 mb-1">Full Name</label>
              <p className="text-foreground font-medium bg-background/50 rounded-xl px-4 py-3 border border-border/50">
                {profile?.full_name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/50 mb-1">Role</label>
              <p className="text-foreground font-medium bg-background/50 rounded-xl px-4 py-3 border border-border/50 capitalize">
                {profile?.role}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/50 mb-1">Phone Number</label>
              <p className="text-foreground font-medium bg-background/50 rounded-xl px-4 py-3 border border-border/50">
                +91 {profile?.phone_number}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-red-500/5 border border-red-500/10 p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-red-500 mb-2">Danger Zone</h2>
          <p className="text-sm text-red-500/70 mb-6">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-all active:scale-95">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
