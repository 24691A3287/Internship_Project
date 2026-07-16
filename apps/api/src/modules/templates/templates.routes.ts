import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { validate } from '../../middleware/validate'
import { z } from 'zod'
import prisma from '../../config/database'
import { ApiResponse } from '../../utils/apiResponse'
import { parsePagination, buildPaginationMeta } from '../../utils/pagination'

const CreateTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(500).optional(),
    category: z.string().max(50).optional(),
    type: z
      .enum(['URL', 'VCARD', 'WIFI', 'TEXT', 'EMAIL', 'PHONE', 'SMS', 'CRYPTO', 'LOCATION', 'EVENT'])
      .default('URL'),
    style: z.enum(['STANDARD', 'ROUNDED', 'DOTS', 'CLASSY']).default('STANDARD'),
    fgColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .default('#000000'),
    bgColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .default('#ffffff'),
    errorCorrection: z.enum(['L', 'M', 'Q', 'H']).default('M'),
    size: z.number().min(100).max(1000).default(300),
    margin: z.number().min(0).max(20).default(4),
    logoUrl: z.string().url().optional(),
    isPublic: z.boolean().default(false),
    organizationId: z.string().optional(),
  }),
})

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const { page, limit, skip, take } = parsePagination(req.query)
    const { category, isPublic, search } = req.query

    const where = {
      OR: [
        { createdById: req.user!.id },
        ...(req.query.organizationId
          ? [{ organizationId: req.query.organizationId as string }]
          : []),
        ...(isPublic === 'true' ? [{ isPublic: true }] : []),
      ],
      category: category ? String(category) : undefined,
      name: search ? { contains: String(search), mode: 'insensitive' as const } : undefined,
    }

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      }),
      prisma.template.count({ where }),
    ])

    ApiResponse.paginated(res, templates, buildPaginationMeta(total, page, limit))
  } catch {
    ApiResponse.serverError(res)
  }
})

router.post('/', validate(CreateTemplateSchema), async (req, res) => {
  try {
    const template = await prisma.template.create({
      data: { ...req.body, createdById: req.user!.id },
      include: {
        createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    })
    ApiResponse.created(res, template, 'Template created')
  } catch {
    ApiResponse.serverError(res)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const template = await prisma.template.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    })
    if (!template) {
      ApiResponse.notFound(res, 'Template not found')
      return
    }
    ApiResponse.success(res, template)
  } catch {
    ApiResponse.serverError(res)
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const template = await prisma.template.findUnique({ where: { id: req.params.id } })
    if (!template) {
      ApiResponse.notFound(res, 'Template not found')
      return
    }
    if (template.createdById !== req.user!.id) {
      ApiResponse.forbidden(res, 'You do not own this template')
      return
    }
    const updated = await prisma.template.update({
      where: { id: req.params.id },
      data: req.body,
    })
    ApiResponse.success(res, updated, 'Template updated')
  } catch {
    ApiResponse.serverError(res)
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const template = await prisma.template.findUnique({ where: { id: req.params.id } })
    if (!template) {
      ApiResponse.notFound(res, 'Template not found')
      return
    }
    if (template.createdById !== req.user!.id) {
      ApiResponse.forbidden(res, 'You do not own this template')
      return
    }
    await prisma.template.delete({ where: { id: req.params.id } })
    ApiResponse.success(res, null, 'Template deleted')
  } catch {
    ApiResponse.serverError(res)
  }
})

export default router
