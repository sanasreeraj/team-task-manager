import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MemberControls } from '@/components/TeamControls'
import { Shield } from 'lucide-react'

// Color map for roles
const ROLE_COLORS: Record<string, string> = {
  'Developer': 'bg-blue-500/10 text-blue-600',
  'Designer': 'bg-pink-500/10 text-pink-600',
  'Tester': 'bg-orange-500/10 text-orange-600',
  'Manager': 'bg-purple-500/10 text-purple-600',
  'Team Lead': 'bg-indigo-500/10 text-indigo-600',
  'DevOps': 'bg-emerald-500/10 text-emerald-600',
  'Analyst': 'bg-cyan-500/10 text-cyan-600',
  'Admin': 'bg-rose-500/10 text-rose-600',
  'Member': 'bg-slate-500/10 text-slate-600'
}

export default async function TeamPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (profile?.is_admin !== true) redirect('/dashboard')

  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .order('is_admin', { ascending: false })
    .order('role', { ascending: true })
    .order('full_name', { ascending: true })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Team Management</h1>
        <p className="text-sm text-foreground/50 mt-1">{members?.length || 0} members in your team</p>
      </div>

      <div className="rounded-2xl bg-card border border-border/60 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-border/40">
              <th className="text-left px-5 py-3 text-xs font-semibold text-foreground/50 uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-foreground/50 uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-foreground/50 uppercase tracking-wider">Phone</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-foreground/50 uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-foreground/50 uppercase tracking-wider">Joined</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-foreground/50 uppercase tracking-wider w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {members?.map(member => (
              <tr key={member.id} className="hover:bg-foreground/[0.02] transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary uppercase shrink-0">
                      {member.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        {member.full_name}
                        {member.is_admin && <span title="Admin"><Shield className="w-3 h-3 text-rose-500" /></span>}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-foreground/60">
                  {member.email || '—'}
                </td>
                <td className="px-5 py-3.5 text-sm text-foreground/60">
                  {member.phone_number ? `+91 ${member.phone_number}` : '—'}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${ROLE_COLORS[member.role] || ROLE_COLORS['Member']}`}>
                    {member.role || 'Member'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-foreground/40">
                  {new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <MemberControls member={member} currentUserId={user.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
