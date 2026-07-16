import { z } from 'zod'

export const CreateQRSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(500).optional(),
    type: z
      .enum(['URL', 'VCARD', 'WIFI', 'TEXT', 'EMAIL', 'PHONE', 'SMS', 'CRYPTO', 'LOCATION', 'EVENT'])
      .default('URL'),
    content: z.string().min(1),
    destinationUrl: z.string().url().optional(),
    isDynamic: z.boolean().default(false),
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
    logoUrl: z.string().url().optional(),
    size: z.number().min(100).max(1000).default(300),
    margin: z.number().min(0).max(20).default(4),
    folderId: z.string().optional(),
    organizationId: z.string().optional(),
  }),
})

export const UpdateQRSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(500).optional(),
    content: z.string().min(1).optional(),
    destinationUrl: z.string().url().optional().nullable(),
    isActive: z.boolean().optional(),
    style: z.enum(['STANDARD', 'ROUNDED', 'DOTS', 'CLASSY']).optional(),
    fgColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional(),
    bgColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional(),
    errorCorrection: z.enum(['L', 'M', 'Q', 'H']).optional(),
    logoUrl: z.string().url().optional().nullable(),
    size: z.number().min(100).max(1000).optional(),
    margin: z.number().min(0).max(20).optional(),
    folderId: z.string().optional().nullable(),
  }),
})

export const BulkDeleteSchema = z.object({
  body: z.object({
    ids: z.array(z.string()).min(1).max(100),
  }),
})
