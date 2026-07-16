import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Panel' }

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Platform-wide administration and oversight</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '—', emoji: '👥' },
          { label: 'Total Organizations', value: '—', emoji: '🏢' },
          { label: 'Total QR Codes', value: '—', emoji: '📱' },
          { label: 'Total Scans', value: '—', emoji: '📊' },
        ].map(({ label, value, emoji }) => (
          <div key={label} className="p-5 rounded-xl border border-border bg-card">
            <div className="text-2xl mb-2">{emoji}</div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
