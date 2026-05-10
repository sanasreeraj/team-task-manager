import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DesignationSelect, RemoveMemberButton } from '@/components/TeamControls'

export default async function TeamPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .order('role', { ascending: true })
    .order('full_name', { ascending: true })

  // Get email from auth for each member
  // Note: we can't get other users' emails from client-side Supabase.
  // We'll show what we have.

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Team Management</h1>
        <p className="text-sm text-foreground/50 mt-1">{members?.length || 0} members in your team</p>
      </div>

      <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/40">
              <th className="text-left px-5 py-3 text-xs font-semibold text-foreground/50 uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-foreground/50 uppercase tracking-wider">Phone</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-foreground/50 uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-foreground/50 uppercase tracking-wider">Designation</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-foreground/50 uppercase tracking-wider">Joined</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-foreground/50 uppercase tracking-wider w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {members?.map(member => (
              <tr key={member.id} className="hover:bg-foreground/[0.02] transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary uppercase shrink-0">
                      {member.full_name?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm font-medium text-foreground">{member.full_name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-foreground/60">
                  {member.phone_number ? `+91 ${member.phone_number}` : '—'}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    member.role === 'admin' ? 'bg-purple-500/10 text-purple-600' : 'bg-blue-500/10 text-blue-600'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <DesignationSelect memberId={member.id} currentDesignation={member.designation || 'Member'} />
                </td>
                <td className="px-5 py-3.5 text-sm text-foreground/40">
                  {new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <RemoveMemberButton memberId={member.id} memberName={member.full_name} isSelf={member.id === user.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
