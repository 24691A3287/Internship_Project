'use client'
import { Bell, Moon, Sun, Plus, Search } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3 max-w-md flex-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search QR codes..."
            className="pl-9 bg-secondary/50 border-transparent focus-visible:border-ring h-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/dashboard/qrcodes/new">
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Plus className="size-4" />
            <span className="hidden sm:inline">New QR</span>
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <Button variant="ghost" size="icon" className="size-9 relative">
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-2 bg-violet-600 rounded-full" />
        </Button>
      </div>
    </header>
  )
}
