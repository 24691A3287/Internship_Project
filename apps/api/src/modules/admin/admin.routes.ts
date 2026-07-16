import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { requireSuperAdmin } from '../../middleware/rbac'
import prisma from '../../config/database'
import { ApiResponse } from '../../utils/apiResponse'
import { parsePagination, buildPaginationMeta } from '../../utils/pagination'

const router = Router()
router.use(requireAuth, requireSuperAdmin)

// System overview stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalOrgs, totalQRCodes, totalScans, activeSubscriptions] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.qRCode.count(),
      prisma.qRScan.count(),
      prisma.subscription.count({ where: { plan: { not: 'FREE' } } }),
    ])

    ApiResponse.success(res, {
      totalUsers,
      totalOrgs,
      totalQRCodes,
      totalScans,
      activeSubscriptions,
    })
  } catch {
    ApiResponse.serverError(res)
  }
})

// List all organizations
router.get('/organizations', async (req, res) => {
  try {
    const { page, limit, skip, take } = parsePagination(req.query)
    const search = req.query.search as string | undefined

    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {}

    const [orgs, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take,
        include: {
          subscription: true,
          _count: { select: { members: true, qrCodes: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.organization.count({ where }),
    ])

    ApiResponse.paginated(res, orgs, buildPaginationMeta(total, page, limit))
  } catch {
    ApiResponse.serverError(res)
  }
})

// Get all subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    const { page, limit, skip, take } = parsePagination(req.query)

    const [subs, total] = await Promise.all([
      prisma.subscription.findMany({
        skip,
        take,
        include: { organization: { select: { id: true, name: true, slug: true } } },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.subscription.count(),
    ])

    ApiResponse.paginated(res, subs, buildPaginationMeta(total, page, limit))
  } catch {
    ApiResponse.serverError(res)
  }
})

// Update subscription plan
router.patch('/subscriptions/:orgId', async (req, res) => {
  try {
    const { plan, qrCodeLimit, scanLimit } = req.body
    const sub = await prisma.subscription.update({
      where: { organizationId: req.params.orgId },
      data: { plan, qrCodeLimit, scanLimit },
    })
    ApiResponse.success(res, sub, 'Subscription updated')
  } catch {
    ApiResponse.serverError(res)
  }
})

export default router
