'use client'
import { useState } from 'react'
import {
  Plus, Grid3X3, List, Search, RefreshCw, Trash2, Copy, QrCode
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useQRCodes, useDeleteQRCode, useDuplicateQRCode } from '@/hooks/useQRCodes'
import { useAuthToken } from '@/hooks/useAuth'
import { useAppStore } from '@/store/useAppStore'
import { formatRelativeTime, formatNumber } from '@/lib/utils'

const TYPE_COLORS: Record<string, string> = {
  URL: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  VCARD: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  WIFI: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  TEXT: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  EMAIL: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  PHONE: 'bg-green-500/10 text-green-600 dark:text-green-400',
}

export function QRCodesContent() {
  useAuthToken()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const { activeOrganizationId, selectedQRIds, clearSelection } = useAppStore()

  const { data, isLoading, refetch } = useQRCodes({
    search: debouncedSearch || undefined,
    organizationId: activeOrganizationId ?? undefined,
  })
  const deleteMutation = useDeleteQRCode()
  const duplicateMutation = useDuplicateQRCode()

  const qrCodes = (data as { data?: unknown[] })?.data ?? []

  const handleSearch = (val: string) => {
    setSearch(val)
    const t = setTimeout(() => setDebouncedSearch(val), 300)
    return () => clearTimeout(t)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">QR Codes</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {(data as { pagination?: { total?: number } })?.pagination?.total ?? 0} total QR codes
          </p>
        </div>
        <Link href="/dashboard/qrcodes/new">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2 w-full sm:w-auto">
            <Plus className="size-4" /> Create QR Code
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search QR codes..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="size-4" />
          </Button>
          <div className="flex items-center border border-border rounded-lg p-0.5">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="size-8" onClick={() => setViewMode('grid')}>
              <Grid3X3 className="size-3.5" />
            </Button>
            <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" className="size-8" onClick={() => setViewMode('table')}>
              <List className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {selectedQRIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
          <span className="text-sm font-medium">{selectedQRIds.length} selected</span>
          <Button variant="outline" size="sm" onClick={clearSelection}>Clear</Button>
          <Button variant="destructive" size="sm" className="gap-1.5">
            <Trash2 className="size-3.5" /> Delete Selected
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && qrCodes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="p-5 rounded-full bg-muted">
            <QrCode className="size-10 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">No QR codes yet</h3>
            <p className="text-muted-foreground text-sm">Create your first QR code to get started</p>
          </div>
          <Link href="/dashboard/qrcodes/new">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <Plus className="size-4 mr-2" /> Create QR Code
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && viewMode === 'grid' && qrCodes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(qrCodes as Record<string, unknown>[]).map((qr) => (
            <Card
              key={qr.id as string}
              className="group relative overflow-hidden transition-all hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-0.5"
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-white rounded-lg mb-3 flex items-center justify-center border">
                  <div className="text-center p-2">
                    <QrCode className="size-12 text-slate-800 mx-auto mb-1" />
                    <span className="text-slate-400 text-[10px] font-mono">{qr.shortCode as string}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm truncate flex-1">{qr.name as string}</h3>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md flex-shrink-0 ${TYPE_COLORS[qr.type as string] ?? ''}`}>
                      {qr.type as string}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(qr.totalScans as number)} scans · {formatRelativeTime(qr.createdAt as string)}
                  </p>
                </div>
                <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform bg-gradient-to-t from-background via-background to-transparent p-3 flex gap-1.5">
                  <Link href={`/dashboard/qrcodes/${qr.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs h-7">Edit</Button>
                  </Link>
                  <Button variant="outline" size="icon" className="size-7" onClick={() => duplicateMutation.mutate(qr.id as string)}>
                    <Copy className="size-3" />
                  </Button>
                  <Button
                    variant="outline" size="icon" className="size-7 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => deleteMutation.mutate(qr.id as string)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
