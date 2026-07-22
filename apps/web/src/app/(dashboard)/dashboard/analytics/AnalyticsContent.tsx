'use client'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import { useAuthToken } from '@/hooks/useAuth'
import { formatNumber } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'
import { MousePointerClick, Globe, Smartphone, TrendingUp } from 'lucide-react'

const COLORS = ['#7c3aed', '#3b82f6', '#22c55e', '#f97316', '#ec4899', '#06b6d4', '#eab308', '#f43f5e']

export function AnalyticsContent() {
  useAuthToken()
  const { activeOrganizationId } = useAppStore()

  const { data: overview } = useQuery({
    queryKey: ['analytics', 'overview', activeOrganizationId],
    queryFn: () => activeOrganizationId ? analyticsApi.overview(activeOrganizationId).then(r => r.data.data) : Promise.resolve(null),
    enabled: !!activeOrganizationId,
  })

  const { data: timeSeries } = useQuery({
    queryKey: ['analytics', 'timeseries', activeOrganizationId],
    queryFn: () => activeOrganizationId ? analyticsApi.timeSeries(activeOrganizationId).then(r => r.data.data) : Promise.resolve([]),
    enabled: !!activeOrganizationId,
  })

  const { data: geo } = useQuery({
    queryKey: ['analytics', 'geo', activeOrganizationId],
    queryFn: () => activeOrganizationId ? analyticsApi.geo(activeOrganizationId).then(r => r.data.data) : Promise.resolve([]),
    enabled: !!activeOrganizationId,
  })

  const { data: devices } = useQuery({
    queryKey: ['analytics', 'devices', activeOrganizationId],
    queryFn: () => activeOrganizationId ? analyticsApi.devices(activeOrganizationId).then(r => r.data.data) : Promise.resolve([]),
    enabled: !!activeOrganizationId,
  })

  const ov = overview as Record<string, number> | null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Scan insights and performance data</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Scans', value: ov?.totalScans ?? 0, icon: MousePointerClick, color: 'text-blue-500', bg: 'bg-blue-500/10', isNum: true },
          { label: 'Unique Scans', value: ov?.uniqueScans ?? 0, icon: Globe, color: 'text-violet-500', bg: 'bg-violet-500/10', isNum: true },
          { label: 'Scan Growth', value: `${ov?.scanGrowth ?? 0}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', isNum: false },
          { label: 'Active QRs', value: ov?.activeQRCodes ?? 0, icon: Smartphone, color: 'text-orange-500', bg: 'bg-orange-500/10', isNum: true },
        ].map(({ label, value, icon: Icon, color, bg, isNum }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold mt-1">{isNum ? formatNumber(value as number) : value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${bg}`}><Icon className={`size-5 ${color}`} /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan Activity</CardTitle>
          <CardDescription>Daily scans over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={(timeSeries as { date: string; scans: number; uniqueScans: number }[]) ?? []}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="scans" name="Total Scans" stroke="#7c3aed" fill="url(#grad1)" strokeWidth={2} />
              <Area type="monotone" dataKey="uniqueScans" name="Unique Scans" stroke="#3b82f6" fill="url(#grad2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Top Countries</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={((geo as { country: string; scans: number }[]) ?? []).slice(0, 6)} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="country" tick={{ fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="scans" fill="#7c3aed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Device Breakdown</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-6">
            <ResponsiveContainer width="60%" height={180}>
              <PieChart>
                <Pie data={(devices as { device: string; scans: number; percentage: number }[]) ?? []} dataKey="scans" nameKey="device" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                  {((devices as unknown[]) ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {((devices as { device: string; percentage: number }[]) ?? []).map((d, i) => (
                <div key={d.device} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="capitalize">{d.device}</span>
                  </div>
                  <span className="font-medium text-muted-foreground">{d.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
