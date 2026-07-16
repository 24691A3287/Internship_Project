import { z } from 'zod'

export const CreateOrgSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    slug: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    description: z.string().max(500).optional(),
    website: z.string().url().optional(),
    logoUrl: z.string().url().optional(),
  }),
})

export const UpdateOrgSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    website: z.string().url().optional().nullable(),
    logoUrl: z.string().url().optional().nullable(),
  }),
})

export const InviteMemberSchema = z.object({
  body: z.object({
    email: z.string().email(),
    role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
  }),
})

export const UpdateMemberRoleSchema = z.object({
  body: z.object({
    role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
  }),
})
