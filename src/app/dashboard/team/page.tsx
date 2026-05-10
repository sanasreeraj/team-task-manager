import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { User, Phone, Mail } from 'lucide-react'
import { DeleteMemberButton } from '@/components/DeleteMemberButton'

export default async function TeamPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Team Management</h1>
        <p className="text-sm text-foreground/70 mt-1">
          Manage your team members and their contact information
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {members?.map((member) => (
          <div
            key={member.id}
            className="group rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{member.full_name}</h3>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    member.role === 'admin' ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                  )}>
                    {member.role}
                  </span>
                </div>
              </div>
              {member.id !== user.id && (
                <DeleteMemberButton memberId={member.id} memberName={member.full_name} />
              )}
            </div>
            
            <div className="space-y-3 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs text-foreground/60">
                <Phone className="w-3.5 h-3.5" />
                <span>+91 {member.phone_number || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground/60">
                <Mail className="w-3.5 h-3.5" />
                <span>Joined {new Date(member.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
