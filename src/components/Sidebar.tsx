'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, CheckSquare, Users, Settings, LogOut, Sun, Moon } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function Sidebar({ logoutAction, role, userName }: { logoutAction: () => void, role: string, userName: string }) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban, exact: false },
    { name: 'My Tasks', href: '/dashboard/tasks', icon: CheckSquare, exact: true },
  ]

  if (role === 'admin') {
    navigation.push({ name: 'Team', href: '/dashboard/team', icon: Users, exact: true })
  }

  navigation.push({ name: 'Settings', href: '/dashboard/settings', icon: Settings, exact: true })

  const isActive = (item: typeof navigation[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div className="flex h-full w-64 flex-col bg-card/80 backdrop-blur-xl border-r border-border/50 shadow-sm transition-colors duration-300">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border/50">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Task Manager</h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col mt-6">
        <ul role="list" className="flex flex-1 flex-col gap-y-7 px-4">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const active = isActive(item)
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        active
                           ? 'bg-primary/10 text-primary'
                           : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5',
                        'group flex gap-x-3 rounded-xl p-2.5 text-sm leading-6 font-medium transition-all active:scale-[0.98]'
                      )}
                    >
                      <item.icon
                        className={cn(
                          active ? 'text-primary' : 'text-foreground/50 group-hover:text-foreground/80',
                          'h-5 w-5 shrink-0 transition-colors'
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
          <li className="mt-auto mb-4 space-y-2">
            {/* User info */}
            <div className="flex items-center gap-3 px-2 py-3 mb-2 border-t border-border/30 pt-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary uppercase">
                {userName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{userName || 'User'}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40">{role}</p>
              </div>
            </div>

            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="group flex w-full gap-x-3 rounded-xl p-2.5 text-sm leading-6 font-medium text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-all active:scale-[0.98]"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 shrink-0 text-foreground/50 group-hover:text-foreground/80 transition-colors" />
                ) : (
                  <Moon className="h-5 w-5 shrink-0 text-foreground/50 group-hover:text-foreground/80 transition-colors" />
                )}
                Toggle Theme
              </button>
            )}
            <form action={logoutAction}>
              <button
                type="submit"
                className="group flex w-full gap-x-3 rounded-xl p-2.5 text-sm leading-6 font-medium text-foreground/70 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-[0.98]"
              >
                <LogOut className="h-5 w-5 shrink-0 text-foreground/50 group-hover:text-red-500/80 transition-colors" aria-hidden="true" />
                Sign out
              </button>
            </form>
          </li>
        </ul>
      </nav>
    </div>
  )
}
