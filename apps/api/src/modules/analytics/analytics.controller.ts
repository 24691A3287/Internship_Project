import { Request, Response } from 'express'
import { ApiResponse } from '../../utils/apiResponse'
import * as analyticsService from '../../services/analytics.service'
import { parsePagination, buildPaginationMeta } from '../../utils/pagination'
import prisma from '../../config/database'

export async function getOverview(req: Request, res: Response): Promise<void> {
  try {
    const organizationId = req.query.organizationId as string
    const days = Number(req.query.days ?? 30)
    if (!organizationId) {
      ApiResponse.error(res, 'organizationId required')
      return
    }
    const data = await analyticsService.getOrganizationOverview(organizationId, days)
    ApiResponse.success(res, data)
  } catch (error) {
    ApiResponse.serverError(res, 'Failed to fetch analytics')
  }
}

export async function getTimeSeries(req: Request, res: Response): Promise<void> {
  try {
    const organizationId = req.query.organizationId as string
    const days = Number(req.query.days ?? 30)
    if (!organizationId) {
      ApiResponse.error(res, 'organizationId required')
      return
    }
    const data = await analyticsService.getTimeSeries(organizationId, days)
    ApiResponse.success(res, data)
  } catch (error) {
    ApiResponse.serverError(res, 'Failed to fetch time series')
  }
}

export async function getGeo(req: Request, res: Response): Promise<void> {
  try {
    const organizationId = req.query.organizationId as string
    const days = Number(req.query.days ?? 30)
    if (!organizationId) {
      ApiResponse.error(res, 'organizationId required')
      return
    }
    const data = await analyticsService.getGeoBreakdown(organizationId, days)
    ApiResponse.success(res, data)
  } catch (error) {
    ApiResponse.serverError(res, 'Failed to fetch geo data')
  }
}

export async function getDevices(req: Request, res: Response): Promise<void> {
  try {
    const organizationId = req.query.organizationId as string
    const days = Number(req.query.days ?? 30)
    if (!organizationId) {
      ApiResponse.error(res, 'organizationId required')
      return
    }
    const data = await analyticsService.getDeviceBreakdown(organizationId, days)
    ApiResponse.success(res, data)
  } catch (error) {
    ApiResponse.serverError(res, 'Failed to fetch device data')
  }
}

export async function getQRAnalytics(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const days = Number(req.query.days ?? 30)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const [qrCode, totalScans, recentScans] = await Promise.all([
      prisma.qRCode.findUnique({ where: { id } }),
      prisma.qRScan.count({ where: { qrCodeId: id, scannedAt: { gte: since } } }),
      prisma.qRScan.findMany({
        where: { qrCodeId: id },
        orderBy: { scannedAt: 'desc' },
        take: 20,
      }),
    ])

    if (!qrCode) {
      ApiResponse.notFound(res, 'QR code not found')
      return
    }

    ApiResponse.success(res, { qrCode, totalScans, recentScans })
  } catch (error) {
    ApiResponse.serverError(res, 'Failed to fetch QR analytics')
  }
}

export async function getScanFeed(req: Request, res: Response): Promise<void> {
  try {
    const { page, limit, skip, take } = parsePagination(req.query)
    const organizationId = req.query.organizationId as string

    const [scans, total] = await Promise.all([
      prisma.qRScan.findMany({
        where: organizationId ? { qrCode: { organizationId } } : {},
        skip,
        take,
        orderBy: { scannedAt: 'desc' },
        include: { qrCode: { select: { id: true, name: true, shortCode: true } } },
      }),
      prisma.qRScan.count({ where: organizationId ? { qrCode: { organizationId } } : {} }),
    ])

    ApiResponse.paginated(res, scans, buildPaginationMeta(total, page, limit))
  } catch (error) {
    ApiResponse.serverError(res, 'Failed to fetch scan feed')
  }
}
