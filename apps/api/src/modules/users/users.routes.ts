import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { requireSuperAdmin } from '../../middleware/rbac'
import { validate } from '../../middleware/validate'
import { z } from 'zod'
import prisma from '../../config/database'
import { ApiResponse } from '../../utils/apiResponse'
import { parsePagination, buildPaginationMeta } from '../../utils/pagination'

const UpdateUserSchema = z.object({
  body: z.object({
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
    isActive: z.boolean().optional(),
  }),
})

const router = Router()
router.use(requireAuth)

// GET /users/me - current user profile
router.get('/me', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        memberships: {
          include: {
            organization: {
              include: { subscription: true },
            },
          },
        },
      },
    })
    if (!user) {
      ApiResponse.notFound(res, 'User not found')
      return
    }
    ApiResponse.success(res, user)
  } catch {
    ApiResponse.serverError(res)
  }
})

// PATCH /users/me - update own profile
router.patch('/me', validate(UpdateUserSchema), async (req, res) => {
  try {
    const { role, isActive, ...safeData } = req.body // Prevent self-role escalation
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: safeData,
    })
    ApiResponse.success(res, user, 'Profile updated')
  } catch {
    ApiResponse.serverError(res)
  }
})

// Admin routes
router.get('/', requireSuperAdmin, async (req, res) => {
  try {
    const { page, limit, skip, take } = parsePagination(req.query)
    const search = req.query.search as string | undefined

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: { select: { qrCodes: true, memberships: true } },
        },
      }),
      prisma.user.count({ where }),
    ])

    ApiResponse.paginated(res, users, buildPaginationMeta(total, page, limit))
  } catch {
    ApiResponse.serverError(res)
  }
})

router.get('/:id', requireSuperAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        memberships: { include: { organization: true } },
        _count: { select: { qrCodes: true, apiKeys: true } },
      },
    })
    if (!user) {
      ApiResponse.notFound(res, 'User not found')
      return
    }
    ApiResponse.success(res, user)
  } catch {
    ApiResponse.serverError(res)
  }
})

router.patch('/:id', requireSuperAdmin, validate(UpdateUserSchema), async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
    })
    ApiResponse.success(res, user, 'User updated')
  } catch {
    ApiResponse.serverError(res)
  }
})

export default router
