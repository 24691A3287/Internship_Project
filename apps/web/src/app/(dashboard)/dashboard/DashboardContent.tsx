'use client'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import { useAuthToken } from '@/hooks/useAuth'
import { QrCode, TrendingUp, MousePointerClick, Activity, Plus, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/utils'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const STATS = [
  { key: 'totalQRCodes', label: 'Total QR Codes', icon: QrCode, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { key: 'totalScans', label: 'Total Scans', icon: MousePointerClick, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { key: 'activeQRCodes', label: 'Active QR Codes', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { key: 'scanGrowth', label: 'Scan Growth', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10', suffix: '%' },
]

export function DashboardContent() {
  useAuthToken()
  const { activeOrganizationId } = useAppStore()

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics', 'overview', activeOrganizationId],
    queryFn: () =>
      activeOrganizationId
        ? analyticsApi.overview(activeOrganizationId).then((r) => r.data.data)
        : Promise.resolve(null),
    enabled: !!activeOrganizationId,
  })

  const { data: timeSeries } = useQuery({
    queryKey: ['analytics', 'timeseries', activeOrganizationId],
    queryFn: () =>
      activeOrganizationId
        ? analyticsApi.timeSeries(activeOrganizationId).then((r) => r.data.data)
        : Promise.resolve([]),
    enabled: !!activeOrganizationId,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <Link href="/dashboard/qrcodes/new">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Plus className="size-4" /> Create QR Code
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ key, label, icon: Icon, color, bg, suffix }) => (
          <Card key={key} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-3xl font-bold mt-1">
                    {overviewLoading ? (
                      <span className="animate-pulse bg-muted rounded h-8 w-16 block" />
                    ) : (
                      <>{formatNumber((overview as Record<string, number>)?.[key] ?? 0)}{suffix}</>
                    )}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${bg}`}>
                  <Icon className={`size-5 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Scan Trends</CardTitle>
            <CardDescription>Daily scan activity over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={(timeSeries as { date: string; scans: number }[]) ?? []}>
                <defs>
                  <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="scans" stroke="#7c3aed" fill="url(#scanGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Create URL QR', href: '/dashboard/qrcodes/new?type=URL', emoji: '🌐' },
              { label: 'Create vCard QR', href: '/dashboard/qrcodes/new?type=VCARD', emoji: '👤' },
              { label: 'Create WiFi QR', href: '/dashboard/qrcodes/new?type=WIFI', emoji: '📶' },
              { label: 'View Analytics', href: '/dashboard/analytics', emoji: '📊' },
              { label: 'Invite Team Member', href: '/dashboard/organization', emoji: '👥' },
            ].map(({ label, href, emoji }) => (
              <Link key={href} href={href}>
                <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent transition-colors group cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{emoji}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {!activeOrganizationId && (
        <Card className="border-dashed border-violet-500/50 bg-violet-500/5">
          <CardContent className="flex flex-col items-center text-center py-10 gap-4">
            <div className="p-4 rounded-full bg-violet-500/10">
              <QrCode className="size-8 text-violet-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Create your first QR code</h3>
              <p className="text-muted-foreground text-sm mt-1">Get started by creating a QR code</p>
            </div>
            <Link href="/dashboard/qrcodes/new">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                <Plus className="size-4 mr-2" /> Create QR Code
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
