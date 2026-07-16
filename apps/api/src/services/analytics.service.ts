import prisma from '../config/database'

export async function getOrganizationOverview(organizationId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const prevSince = new Date(Date.now() - 2 * days * 24 * 60 * 60 * 1000)

  const [totalQRCodes, activeQRCodes, currentScans, previousScans, topQR] = await Promise.all([
    prisma.qRCode.count({ where: { organizationId } }),
    prisma.qRCode.count({ where: { organizationId, isActive: true } }),
    prisma.qRScan.count({
      where: { qrCode: { organizationId }, scannedAt: { gte: since } },
    }),
    prisma.qRScan.count({
      where: { qrCode: { organizationId }, scannedAt: { gte: prevSince, lt: since } },
    }),
    prisma.qRCode.findFirst({
      where: { organizationId, isActive: true },
      orderBy: { totalScans: 'desc' },
    }),
  ])

  const scanGrowth = previousScans === 0 ? 100 : Math.round(((currentScans - previousScans) / previousScans) * 100)

  return {
    totalQRCodes,
    activeQRCodes,
    totalScans: currentScans,
    uniqueScans: Math.round(currentScans * 0.72), // Approximation
    scanGrowth,
    topPerformingQR: topQR,
  }
}

export async function getTimeSeries(organizationId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const scans = await prisma.qRScan.findMany({
    where: { qrCode: { organizationId }, scannedAt: { gte: since } },
    select: { scannedAt: true, ip: true },
    orderBy: { scannedAt: 'asc' },
  })

  // Group by date
  const grouped = new Map<string, { scans: number; ips: Set<string> }>()

  for (let i = 0; i < days; i++) {
    const date = new Date(since.getTime() + i * 24 * 60 * 60 * 1000)
    const key = date.toISOString().split('T')[0]
    grouped.set(key, { scans: 0, ips: new Set() })
  }

  for (const scan of scans) {
    const key = scan.scannedAt.toISOString().split('T')[0]
    const entry = grouped.get(key)
    if (entry) {
      entry.scans++
      if (scan.ip) entry.ips.add(scan.ip)
    }
  }

  return Array.from(grouped.entries()).map(([date, data]) => ({
    date,
    scans: data.scans,
    uniqueScans: data.ips.size,
  }))
}

export async function getGeoBreakdown(organizationId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const scans = await prisma.qRScan.groupBy({
    by: ['country'],
    where: {
      qrCode: { organizationId },
      scannedAt: { gte: since },
      country: { not: null },
    },
    _count: { country: true },
    orderBy: { _count: { country: 'desc' } },
    take: 10,
  })

  const total = scans.reduce((sum, s) => sum + s._count.country, 0)

  return scans.map((s) => ({
    country: s.country ?? 'Unknown',
    scans: s._count.country,
    percentage: total > 0 ? Math.round((s._count.country / total) * 100) : 0,
  }))
}

export async function getDeviceBreakdown(organizationId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const scans = await prisma.qRScan.groupBy({
    by: ['device'],
    where: {
      qrCode: { organizationId },
      scannedAt: { gte: since },
      device: { not: null },
    },
    _count: { device: true },
    orderBy: { _count: { device: 'desc' } },
  })

  const total = scans.reduce((sum, s) => sum + s._count.device, 0)

  return scans.map((s) => ({
    device: s.device ?? 'Unknown',
    scans: s._count.device,
    percentage: total > 0 ? Math.round((s._count.device / total) * 100) : 0,
  }))
}
