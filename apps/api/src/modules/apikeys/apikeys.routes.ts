import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { validate } from '../../middleware/validate'
import { z } from 'zod'
import prisma from '../../config/database'
import { ApiResponse } from '../../utils/apiResponse'
import { generateApiKey, hashApiKey } from '../../utils/crypto'

const CreateApiKeySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    organizationId: z.string().optional(),
    expiresAt: z.string().datetime().optional(),
    scopes: z.array(z.string()).default(['read']),
  }),
})

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: {
        createdById: req.user!.id,
        organizationId: (req.query.organizationId as string) ?? undefined,
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        isActive: true,
        scopes: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
        organizationId: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    ApiResponse.success(res, keys)
  } catch {
    ApiResponse.serverError(res)
  }
})

router.post('/', validate(CreateApiKeySchema), async (req, res) => {
  try {
    const { key, prefix } = generateApiKey()
    const keyHash = await hashApiKey(key)

    const apiKey = await prisma.apiKey.create({
      data: {
        ...req.body,
        prefix,
        keyHash,
        createdById: req.user!.id,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        isActive: true,
        scopes: true,
        expiresAt: true,
        createdAt: true,
      },
    })

    // Return the raw key ONCE - never stored again
    ApiResponse.created(res, { ...apiKey, key }, 'API key created. Store this key safely — it will not be shown again.')
  } catch {
    ApiResponse.serverError(res)
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const key = await prisma.apiKey.update({
      where: { id: req.params.id, createdById: req.user!.id },
      data: { isActive: req.body.isActive, name: req.body.name },
      select: {
        id: true,
        name: true,
        prefix: true,
        isActive: true,
        scopes: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    })
    ApiResponse.success(res, key, 'API key updated')
  } catch {
    ApiResponse.serverError(res)
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.apiKey.delete({
      where: { id: req.params.id, createdById: req.user!.id },
    })
    ApiResponse.success(res, null, 'API key revoked')
  } catch {
    ApiResponse.serverError(res)
  }
})

export default router
