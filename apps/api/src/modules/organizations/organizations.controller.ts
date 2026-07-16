import { Request, Response } from 'express'
import { ApiResponse } from '../../utils/apiResponse'
import prisma from '../../config/database'

export async function listOrganizations(req: Request, res: Response): Promise<void> {
  try {
    const orgs = await prisma.organization.findMany({
      where: { members: { some: { userId: req.user!.id } } },
      include: { _count: { select: { members: true, qrCodes: true } }, subscription: true },
      orderBy: { createdAt: 'desc' },
    })
    ApiResponse.success(res, orgs)
  } catch {
    ApiResponse.serverError(res)
  }
}

export async function createOrganization(req: Request, res: Response): Promise<void> {
  try {
    const org = await prisma.organization.create({
      data: {
        ...req.body,
        members: { create: { userId: req.user!.id, role: 'OWNER' } },
        subscription: { create: { plan: 'FREE' } },
      },
      include: { members: true, subscription: true },
    })
    ApiResponse.created(res, org, 'Organization created')
  } catch {
    ApiResponse.serverError(res)
  }
}

export async function getOrganization(req: Request, res: Response): Promise<void> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { members: true, qrCodes: true } }, subscription: true },
    })
    if (!org) {
      ApiResponse.notFound(res)
      return
    }
    ApiResponse.success(res, org)
  } catch {
    ApiResponse.serverError(res)
  }
}

export async function updateOrganization(req: Request, res: Response): Promise<void> {
  try {
    const org = await prisma.organization.update({
      where: { id: req.params.id },
      data: req.body,
    })
    ApiResponse.success(res, org, 'Organization updated')
  } catch {
    ApiResponse.serverError(res)
  }
}

export async function deleteOrganization(req: Request, res: Response): Promise<void> {
  try {
    await prisma.organization.delete({ where: { id: req.params.id } })
    ApiResponse.success(res, null, 'Organization deleted')
  } catch {
    ApiResponse.serverError(res)
  }
}

export async function listMembers(req: Request, res: Response): Promise<void> {
  try {
    const members = await prisma.orgMember.findMany({
      where: { organizationId: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            role: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    })
    ApiResponse.success(res, members)
  } catch {
    ApiResponse.serverError(res)
  }
}

export async function inviteMember(req: Request, res: Response): Promise<void> {
  try {
    const { email, role } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      ApiResponse.error(res, 'User not found. They must sign up first.', 404)
      return
    }

    const existing = await prisma.orgMember.findUnique({
      where: { userId_organizationId: { userId: user.id, organizationId: req.params.id } },
    })
    if (existing) {
      ApiResponse.error(res, 'User is already a member', 409)
      return
    }

    const member = await prisma.orgMember.create({
      data: { userId: user.id, organizationId: req.params.id, role },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    })
    ApiResponse.created(res, member, 'Member added')
  } catch {
    ApiResponse.serverError(res)
  }
}

export async function updateMemberRole(req: Request, res: Response): Promise<void> {
  try {
    const member = await prisma.orgMember.update({
      where: {
        userId_organizationId: { userId: req.params.userId, organizationId: req.params.id },
      },
      data: { role: req.body.role },
    })
    ApiResponse.success(res, member, 'Member role updated')
  } catch {
    ApiResponse.serverError(res)
  }
}

export async function removeMember(req: Request, res: Response): Promise<void> {
  try {
    await prisma.orgMember.delete({
      where: {
        userId_organizationId: { userId: req.params.userId, organizationId: req.params.id },
      },
    })
    ApiResponse.success(res, null, 'Member removed')
  } catch {
    ApiResponse.serverError(res)
  }
}
