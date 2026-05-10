import { Sidebar } from '@/components/Sidebar'
import { logout } from './actions'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user?.id)
    .single()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        logoutAction={logout} 
        role={profile?.role || 'member'} 
        userName={profile?.full_name || 'User'}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-8 transition-all duration-300">
          {children}
        </div>
      </main>
    </div>
  )
}
