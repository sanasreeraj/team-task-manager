'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, CheckSquare, Users, ClipboardList, LogOut } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function Sidebar({ logoutAction, role, userName }: { logoutAction: () => void, role: string, userName: string }) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban, exact: false },
    { name: 'Task Board', href: '/dashboard/tasks', icon: ClipboardList, exact: true },
  ]

  if (role === 'admin') {
    navigation.push({ name: 'My Tasks', href: '/dashboard/my-tasks', icon: CheckSquare, exact: true })
    navigation.push({ name: 'Team', href: '/dashboard/team', icon: Users, exact: true })
  }

  const isActive = (item: typeof navigation[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border/60 transition-colors duration-300">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center px-5 border-b border-border/40">
        <h1 className="text-lg font-bold text-foreground tracking-tight">Task Manager</h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-3 pt-4">
        <ul role="list" className="flex flex-1 flex-col">
          <li>
            <ul role="list" className="space-y-0.5">
              {navigation.map((item) => {
                const active = isActive(item)
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        active
                           ? 'bg-primary/10 text-primary font-semibold'
                           : 'text-foreground/60 hover:text-foreground hover:bg-foreground/[0.04]',
                        'group flex gap-x-3 rounded-lg px-3 py-2 text-[13px] leading-6 font-medium transition-all'
                      )}
                    >
                      <item.icon
                        className={cn(
                          active ? 'text-primary' : 'text-foreground/40 group-hover:text-foreground/70',
                          'h-[18px] w-[18px] shrink-0 transition-colors'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>

          {/* Bottom section */}
          <li className="mt-auto mb-3 space-y-1">
            {/* User info — links to settings */}
            <Link
              href="/dashboard/settings"
              className={cn(
                pathname === '/dashboard/settings'
                  ? 'bg-primary/10 border-primary/20'
                  : 'hover:bg-foreground/[0.04] border-transparent',
                'flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-pointer'
              )}
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary uppercase shrink-0">
                {userName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{userName || 'User'}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-foreground/40 capitalize">{role}</p>
              </div>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="group flex w-full gap-x-3 rounded-lg px-3 py-2 text-[13px] leading-6 font-medium text-foreground/50 hover:bg-red-500/[0.06] hover:text-red-500 transition-all"
              >
                <LogOut className="h-[18px] w-[18px] shrink-0 text-foreground/35 group-hover:text-red-500/70 transition-colors" aria-hidden="true" />
                Sign out
              </button>
            </form>
          </li>
        </ul>
      </nav>
    </div>
  )
}
