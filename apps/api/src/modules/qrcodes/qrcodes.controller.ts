import { Request, Response } from 'express'
import { ApiResponse } from '../../utils/apiResponse'
import { parsePagination, buildPaginationMeta } from '../../utils/pagination'
import { generateShortCode } from '../../utils/crypto'
import { generateQRSVG, generateQRBuffer } from '../../services/qr.service'
import { getGeoFromIP } from '../../services/geo.service'
import prisma from '../../config/database'
import UAParser from 'ua-parser-js'

export async function listQRCodes(req: Request, res: Response): Promise<void> {
  try {
    const { page, limit, skip, take } = parsePagination(req.query)
    const { search, type, folderId, isActive, organizationId } = req.query

    const where = {
      OR: search
        ? [
            { name: { contains: String(search), mode: 'insensitive' as const } },
            { description: { contains: String(search), mode: 'insensitive' as const } },
          ]
        : undefined,
      type: type ? { equals: String(type) as any } : undefined,
      folderId: folderId ? String(folderId) : undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      organizationId: organizationId ? String(organizationId) : undefined,
      createdById: !organizationId ? req.user?.id : undefined,
    }

    const [qrCodes, total] = await Promise.all([
      prisma.qRCode.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          folder: true,
          createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      }),
      prisma.qRCode.count({ where }),
    ])

    ApiResponse.paginated(res, qrCodes, buildPaginationMeta(total, page, limit))
  } catch (error) {
    ApiResponse.serverError(res, 'Failed to fetch QR codes')
  }
}

export async function createQRCode(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body
    const shortCode = generateShortCode(8)

    // If dynamic, content should be the redirect URL
    const content =
      data.isDynamic && data.destinationUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/r/${shortCode}`
        : data.content

    const qrCode = await prisma.qRCode.create({
      data: {
        ...data,
        shortCode,
        content,
        createdById: req.user!.id,
      },
      include: {
        folder: true,
        createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    })

    ApiResponse.created(res, qrCode, 'QR code created successfully')
  } catch (error) {
    console.error(error)
    ApiResponse.serverError(res, 'Failed to create QR code')
  }
}

export async function getQRCode(req: Request, res: Response): Promise<void> {
  try {
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: req.params.id },
      include: {
        folder: true,
        createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
        _count: { select: { scans: true } },
      },
    })
    if (!qrCode) {
      ApiResponse.notFound(res, 'QR code not found')
      return
    }
    ApiResponse.success(res, qrCode)
  } catch (error) {
    ApiResponse.serverError(res, 'Failed to fetch QR code')
  }
}

export async function updateQRCode(req: Request, res: Response): Promise<void> {
  try {
    const qrCode = await prisma.qRCode.findUnique({ where: { id: req.params.id } })
    if (!qrCode) {
      ApiResponse.notFound(res, 'QR code not found')
      return
    }

    const updated = await prisma.qRCode.update({
      where: { id: req.params.id },
      data: req.body,
      include: { folder: true },
    })
    ApiResponse.success(res, updated, 'QR code updated')
  } catch (error) {
    ApiResponse.serverError(res, 'Failed to update QR code')
  }
}

export async function deleteQRCode(req: Request, res: Response): Promise<void> {
  try {
    await prisma.qRCode.update({
      where: { id: req.params.id },
      data: { isActive: false },
    })
    ApiResponse.success(res, null, 'QR code deactivated')
  } catch (error) {
    ApiResponse.serverError(res, 'Failed to delete QR code')
  }
}

export async function duplicateQRCode(req: Request, res: Response): Promise<void> {
  try {
    const original = await prisma.qRCode.findUnique({ where: { id: req.params.id } })
    if (!original) {
      ApiResponse.notFound(res, 'QR code not found')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, shortCode, totalScans, uniqueScans, lastScannedAt, createdAt, updatedAt, ...rest } = original
    const newQR = await prisma.qRCode.create({
      data: {
        ...rest,
        name: `${original.name} (Copy)`,
        shortCode: generateShortCode(8),
        createdById: req.user!.id,
      },
    })
    ApiResponse.created(res, newQR, 'QR code duplicated')
  } catch (error) {
    ApiResponse.serverError(res, 'Failed to duplicate QR code')
  }
}

export async function downloadQRCode(req: Request, res: Response): Promise<void> {
  try {
    const qrCode = await prisma.qRCode.findUnique({ where: { id: req.params.id } })
    if (!qrCode) {
      ApiResponse.notFound(res, 'QR code not found')
      return
    }

    const format = (req.query.format as string) ?? 'png'
    const opts = {
      content: qrCode.content,
      size: qrCode.size,
      margin: qrCode.margin,
      fgColor: qrCode.fgColor,
      bgColor: qrCode.bgColor,
      errorCorrectionLevel: qrCode.errorCorrection as 'L' | 'M' | 'Q' | 'H',
    }

    if (format === 'svg') {
      const svg = await generateQRSVG(opts)
      res.setHeader('Content-Type', 'image/svg+xml')
      res.setHeader('Content-Disposition', `attachment; filename="${qrCode.name}.svg"`)
      res.send(svg)
    } else {
      const buffer = await generateQRBuffer(opts)
      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Content-Disposition', `attachment; filename="${qrCode.name}.png"`)
      res.send(buffer)
    }
  } catch (error) {
    ApiResponse.serverError(res, 'Failed to generate download')
  }
}

export async function bulkDeleteQRCodes(req: Request, res: Response): Promise<void> {
  try {
    const { ids } = req.body
    await prisma.qRCode.updateMany({ where: { id: { in: ids } }, data: { isActive: false } })
    ApiResponse.success(res, { count: ids.length }, `${ids.length} QR codes deactivated`)
  } catch (error) {
    ApiResponse.serverError(res, 'Failed to bulk delete')
  }
}

export async function redirectQRCode(req: Request, res: Response): Promise<void> {
  try {
    const { shortCode } = req.params
    const qrCode = await prisma.qRCode.findUnique({ where: { shortCode } })

    if (!qrCode || !qrCode.isActive) {
      res.status(404).send('<h1>QR Code not found or inactive</h1>')
      return
    }

    // Track scan asynchronously
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ??
      req.socket.remoteAddress ??
      ''
    const parser = new UAParser(req.headers['user-agent'])
    const ua = parser.getResult()

    setImmediate(async () => {
      try {
        const geo = await getGeoFromIP(ip)
        await prisma.$transaction([
          prisma.qRScan.create({
            data: {
              qrCodeId: qrCode.id,
              ip,
              userAgent: req.headers['user-agent'],
              country: geo.country,
              city: geo.city,
              region: geo.region,
              device: ua.device.type ?? 'desktop',
              browser: ua.browser.name,
              os: ua.os.name,
              referrer: req.headers.referer,
            },
          }),
          prisma.qRCode.update({
            where: { id: qrCode.id },
            data: { totalScans: { increment: 1 }, lastScannedAt: new Date() },
          }),
        ])
      } catch (err) {
        console.error('Failed to track scan:', err)
      }
    })

    // Redirect to destination
    const redirectUrl =
      qrCode.isDynamic && qrCode.destinationUrl ? qrCode.destinationUrl : qrCode.content
    res.redirect(302, redirectUrl)
  } catch (error) {
    ApiResponse.serverError(res, 'Redirect failed')
  }
}
