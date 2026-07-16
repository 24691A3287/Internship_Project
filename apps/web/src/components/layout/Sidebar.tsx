'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, QrCode, BarChart3, FolderOpen,
  Building2, Settings, ShieldCheck, ChevronLeft,
  ChevronRight, Zap
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { UserButton, OrganizationSwitcher } from '@clerk/nextjs'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/qrcodes', label: 'QR Codes', icon: QrCode },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/folders', label: 'Folders', icon: FolderOpen },
  { href: '/dashboard/organization', label: 'Organization', icon: Building2 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex-shrink-0 p-1.5 rounded-lg bg-violet-600">
          <QrCode className="size-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="font-bold text-sidebar-foreground text-sm truncate">QR Platform</span>
        )}
      </div>

      {/* Org Switcher */}
      {!sidebarCollapsed && (
        <div className="px-3 py-3 border-b border-sidebar-border">
          <OrganizationSwitcher
            appearance={{
              elements: {
                rootBox: 'w-full',
                organizationSwitcherTrigger:
                  'w-full justify-start bg-sidebar-accent rounded-lg px-2 py-1.5 text-sidebar-foreground text-sm',
              },
            }}
          />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-none">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon className="size-4 flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{label}</span>}
              {isActive && !sidebarCollapsed && (
                <Zap className="size-3 ml-auto text-violet-300 opacity-70" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-3 border-t border-sidebar-border pt-3 space-y-2">
        {!sidebarCollapsed && (
          <Link
            href="/dashboard/admin"
            className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all"
          >
            <ShieldCheck className="size-4 flex-shrink-0" />
            <span>Admin</span>
          </Link>
        )}
        <div className={cn('flex items-center', sidebarCollapsed ? 'justify-center' : 'px-2')}>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 z-10 flex size-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar shadow-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
      >
        {sidebarCollapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
      </button>
    </aside>
  )
}
