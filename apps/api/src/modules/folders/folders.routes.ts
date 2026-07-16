import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { validate } from '../../middleware/validate'
import { z } from 'zod'
import prisma from '../../config/database'
import { ApiResponse } from '../../utils/apiResponse'

const CreateFolderSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .default('#6366f1'),
    organizationId: z.string().optional(),
    parentFolderId: z.string().optional(),
  }),
})

const UpdateFolderSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional(),
    parentFolderId: z.string().optional().nullable(),
  }),
})

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({
      where: {
        organizationId: (req.query.organizationId as string) ?? undefined,
        createdById: req.user!.id,
        parentFolderId: null, // Only top-level by default
      },
      include: {
        _count: { select: { qrCodes: true } },
        children: { include: { _count: { select: { qrCodes: true } } } },
      },
      orderBy: { name: 'asc' },
    })
    ApiResponse.success(res, folders)
  } catch {
    ApiResponse.serverError(res)
  }
})

router.post('/', validate(CreateFolderSchema), async (req, res) => {
  try {
    const folder = await prisma.folder.create({
      data: { ...req.body, createdById: req.user!.id },
    })
    ApiResponse.created(res, folder)
  } catch {
    ApiResponse.serverError(res)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { qrCodes: true } },
        children: { include: { _count: { select: { qrCodes: true } } } },
        qrCodes: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    })
    if (!folder) {
      ApiResponse.notFound(res, 'Folder not found')
      return
    }
    ApiResponse.success(res, folder)
  } catch {
    ApiResponse.serverError(res)
  }
})

router.patch('/:id', validate(UpdateFolderSchema), async (req, res) => {
  try {
    const folder = await prisma.folder.update({
      where: { id: req.params.id },
      data: req.body,
    })
    ApiResponse.success(res, folder, 'Folder updated')
  } catch {
    ApiResponse.serverError(res)
  }
})

router.delete('/:id', async (req, res) => {
  try {
    // Move QR codes out of the folder before deleting
    await prisma.qRCode.updateMany({
      where: { folderId: req.params.id },
      data: { folderId: null },
    })
    await prisma.folder.delete({ where: { id: req.params.id } })
    ApiResponse.success(res, null, 'Folder deleted')
  } catch {
    ApiResponse.serverError(res)
  }
})

export default router
