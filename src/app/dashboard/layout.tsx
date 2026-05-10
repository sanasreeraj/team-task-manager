import { Sidebar } from '@/components/Sidebar'
import { logout } from './actions'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar logoutAction={logout} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-8 transition-all duration-300">
          {children}
        </div>
      </main>
    </div>
  )
}
