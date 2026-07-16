import { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '../utils/apiResponse'
import prisma from '../config/database'

export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'

const ROLE_HIERARCHY: Record<OrgRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
}

export function requireOrgRole(minRole: OrgRole) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user
    if (!user) {
      ApiResponse.unauthorized(res)
      return
    }

    // Super admins bypass all RBAC
    if (user.role === 'SUPER_ADMIN') {
      next()
      return
    }

    const organizationId = req.params.organizationId ?? req.organizationId ?? req.body?.organizationId
    if (!organizationId) {
      ApiResponse.error(res, 'Organization ID required', 400)
      return
    }

    const membership = await prisma.orgMember.findUnique({
      where: { userId_organizationId: { userId: user.id, organizationId } },
    })

    if (!membership) {
      ApiResponse.forbidden(res, 'You are not a member of this organization')
      return
    }

    const userRoleLevel = ROLE_HIERARCHY[membership.role as OrgRole] ?? 0
    const requiredLevel = ROLE_HIERARCHY[minRole]

    if (userRoleLevel < requiredLevel) {
      ApiResponse.forbidden(res, `This action requires ${minRole} role or higher`)
      return
    }

    req.organizationId = organizationId
    next()
  }
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    ApiResponse.unauthorized(res)
    return
  }
  if (req.user.role !== 'SUPER_ADMIN') {
    ApiResponse.forbidden(res, 'Super admin access required')
    return
  }
  next()
}
