import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Phone, Shield } from 'lucide-react'

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
        <p className="text-sm text-foreground/50 mt-1">
          Your account information
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border/30">
            <h2 className="text-sm font-semibold text-foreground">Profile</h2>
          </div>
          <div className="divide-y divide-border/20">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-foreground/30" />
                <span className="text-sm text-foreground/60">Full Name</span>
              </div>
              <span className="text-sm font-medium text-foreground">{profile?.full_name}</span>
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-foreground/30" />
                <span className="text-sm text-foreground/60">Email</span>
              </div>
              <span className="text-sm font-medium text-foreground">{user.email}</span>
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-foreground/30" />
                <span className="text-sm text-foreground/60">Phone</span>
              </div>
              <span className="text-sm font-medium text-foreground">+91 {profile?.phone_number || '—'}</span>
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-foreground/30" />
                <span className="text-sm text-foreground/60">Role</span>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                profile?.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
              }`}>
                {profile?.role}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border/30">
            <h2 className="text-sm font-semibold text-foreground">Account</h2>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground/60">Member since</p>
              <p className="text-xs text-foreground/30 mt-0.5">{new Date(profile?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
