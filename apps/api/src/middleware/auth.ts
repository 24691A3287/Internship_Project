import { Request, Response, NextFunction } from 'express'
import { createClerkClient } from '@clerk/express'
import { ApiResponse } from '../utils/apiResponse'
import prisma from '../config/database'
import { env } from '../config/env'

const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY })

export interface AuthUser {
  id: string
  clerkId: string
  email: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
      organizationId?: string
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      ApiResponse.unauthorized(res, 'Missing or invalid authorization header')
      return
    }

    const token = authHeader.substring(7)

    // Verify Clerk session token
    const payload = await clerk.verifyToken(token)
    if (!payload?.sub) {
      ApiResponse.unauthorized(res, 'Invalid or expired token')
      return
    }

    // Get user from DB
    let user = await prisma.user.findUnique({ where: { clerkId: payload.sub } })

    if (!user) {
      // Auto-create user on first API call
      const clerkUser = await clerk.users.getUser(payload.sub)
      user = await prisma.user.create({
        data: {
          clerkId: payload.sub,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        },
      })
    }

    req.user = {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      role: user.role,
    }

    next()
  } catch (error) {
    ApiResponse.unauthorized(res, 'Authentication failed')
  }
}

export async function requireApiKeyAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const apiKey = req.headers['x-api-key'] as string
  if (!apiKey) {
    await requireAuth(req, res, next)
    return
  }

  try {
    const { verifyApiKey } = await import('../utils/crypto')
    const keys = await prisma.apiKey.findMany({
      where: { isActive: true },
      include: { createdBy: true },
    })

    for (const key of keys) {
      const valid = await verifyApiKey(apiKey, key.keyHash)
      if (valid) {
        req.user = {
          id: key.createdBy.id,
          clerkId: key.createdBy.clerkId,
          email: key.createdBy.email,
          role: key.createdBy.role,
        }
        req.organizationId = key.organizationId
        await prisma.apiKey.update({
          where: { id: key.id },
          data: { lastUsedAt: new Date() },
        })
        next()
        return
      }
    }

    ApiResponse.unauthorized(res, 'Invalid API key')
  } catch (error) {
    ApiResponse.serverError(res, 'API key verification failed')
  }
}
