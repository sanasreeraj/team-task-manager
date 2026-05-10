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

export function Sidebar({ logoutAction, role }: { logoutAction: () => void, role: string }) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'My Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  ]

  if (role === 'admin') {
    navigation.push({ name: 'Team', href: '/dashboard/team', icon: Users })
  }

  navigation.push({ name: 'Settings', href: '/dashboard/settings', icon: Settings })

  return (
    <div className="flex h-full w-64 flex-col bg-card/80 backdrop-blur-xl border-r border-border/50 shadow-sm transition-colors duration-300">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border/50">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Task Manager</h1>
      </div>
      <nav className="flex flex-1 flex-col mt-6">
        <ul role="list" className="flex flex-1 flex-col gap-y-7 px-4">
          <li>
            <ul role="list" className="-mx-2 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        isActive
                           ? 'bg-primary/10 text-primary'
                           : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5',
                        'group flex gap-x-3 rounded-xl p-2 text-sm leading-6 font-medium transition-all active:scale-[0.98]'
                      )}
                    >
                      <item.icon
                        className={cn(
                          isActive ? 'text-primary' : 'text-foreground/50 group-hover:text-foreground/80',
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
          <li className="mt-auto mb-4 space-y-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="group flex w-full gap-x-3 rounded-xl p-2 text-sm leading-6 font-medium text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-all active:scale-[0.98]"
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
                className="group flex w-full gap-x-3 rounded-xl p-2 text-sm leading-6 font-medium text-foreground/70 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-[0.98]"
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
