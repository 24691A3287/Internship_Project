import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your account settings and preferences</p>
      </div>
      <div className="space-y-4">
        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="font-semibold mb-1">Profile</h2>
          <p className="text-muted-foreground text-sm">Update your personal information and profile picture.</p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="font-semibold mb-1">API Keys</h2>
          <p className="text-muted-foreground text-sm">Generate and manage API keys for programmatic access.</p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="font-semibold mb-1">Notifications</h2>
          <p className="text-muted-foreground text-sm">Configure how and when you receive notifications.</p>
        </div>
      </div>
    </div>
  )
}
