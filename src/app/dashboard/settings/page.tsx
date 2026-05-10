import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Mail, Shield, Calendar } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { EditableField } from '@/components/EditableField'

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
        <h1 className="text-xl font-bold text-foreground">Account Settings</h1>
        <p className="text-sm text-foreground/50 mt-1">Your profile and preferences</p>
      </div>

      <div className="space-y-4">
        {/* Profile Information */}
        <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40">
            <h2 className="text-sm font-semibold text-foreground">Profile Information</h2>
            <p className="text-[10px] text-foreground/40 mt-0.5">Hover over a field and click the pencil icon to edit</p>
          </div>
          <div className="divide-y divide-border/30">
            <EditableField
              label="Full Name"
              value={profile?.full_name || ''}
              field="full_name"
              iconName="user"
            />
            <div className="px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-foreground/35" />
                <span className="text-sm text-foreground/60">Email</span>
              </div>
              <span className="text-sm font-medium text-foreground">{user.email}</span>
            </div>
            <EditableField
              label="Phone"
              value={profile?.phone_number || ''}
              field="phone_number"
              iconName="phone"
              prefix="+91 "
            />
            <div className="px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-foreground/35" />
                <span className="text-sm text-foreground/60">Role</span>
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                profile?.role === 'admin' ? 'bg-purple-500/10 text-purple-600' : 'bg-blue-500/10 text-blue-600'
              }`}>
                {profile?.role}
              </span>
            </div>
            <div className="px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-foreground/35" />
                <span className="text-sm text-foreground/60">Joined</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {new Date(profile?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40">
            <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground/70 font-medium">Theme</p>
              <p className="text-xs text-foreground/40 mt-0.5">Switch between light and dark mode</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}
