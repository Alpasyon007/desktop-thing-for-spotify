'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, themes } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center space-x-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
        <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      </div>
    )
  }

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' }
  ]

  return (
    <div className="flex items-center space-x-1 p-1 rounded-lg border">
      {themeOptions.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          onClick={() => setTheme(value)}
          className={`transition-colors text-sm flex items-center gap-2 ${
            theme === value
              ? ' shadow-sm'
              : 'bg-primary/50'
          }`}
          title={`Switch to ${label} mode`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  )
}
