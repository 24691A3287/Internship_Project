import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Organization' }

export default function OrganizationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organization</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your organization settings and members</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="font-semibold text-lg mb-2">Team Members</h2>
          <p className="text-muted-foreground text-sm">Invite and manage your team members with role-based permissions.</p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="font-semibold text-lg mb-2">Organization Settings</h2>
          <p className="text-muted-foreground text-sm">Configure your organization profile and billing settings.</p>
        </div>
      </div>
    </div>
  )
}
