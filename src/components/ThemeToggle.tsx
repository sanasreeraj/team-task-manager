'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="h-9 w-28 rounded-lg bg-foreground/5 animate-pulse" />

  return (
    <div className="flex items-center bg-foreground/[0.04] rounded-lg p-0.5 border border-border/40">
      <button
        onClick={() => setTheme('light')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          theme === 'light' ? 'bg-card shadow-sm text-foreground border border-border/40' : 'text-foreground/40 hover:text-foreground/60'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
        Light
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          theme === 'dark' ? 'bg-card shadow-sm text-foreground border border-border/40' : 'text-foreground/40 hover:text-foreground/60'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
        Dark
      </button>
    </div>
  )
}
