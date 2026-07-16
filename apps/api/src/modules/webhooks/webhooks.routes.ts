import { Router, Request, Response } from 'express'
import { Webhook } from 'svix'
import prisma from '../../config/database'
import { env } from '../../config/env'

const router = Router()

// Clerk webhook handler - must use raw body
router.post('/clerk', async (req: Request, res: Response) => {
  const webhookSecret = env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.warn('CLERK_WEBHOOK_SECRET not set, skipping webhook verification')
    res.status(200).json({ received: true })
    return
  }

  const svix_id = req.headers['svix-id'] as string
  const svix_timestamp = req.headers['svix-timestamp'] as string
  const svix_signature = req.headers['svix-signature'] as string

  if (!svix_id || !svix_timestamp || !svix_signature) {
    res.status(400).json({ error: 'Missing svix headers' })
    return
  }

  const wh = new Webhook(webhookSecret)
  let evt: { type: string; data: Record<string, any> }

  try {
    evt = wh.verify(JSON.stringify(req.body), {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as { type: string; data: Record<string, any> }
  } catch (err) {
    console.error('Webhook verification failed:', err)
    res.status(400).json({ error: 'Invalid webhook signature' })
    return
  }

  try {
    const { type, data } = evt

    switch (type) {
      case 'user.created': {
        const primaryEmail = data.email_addresses?.find(
          (e: { id: string; email_address: string }) => e.id === data.primary_email_address_id
        )
        await prisma.user.upsert({
          where: { clerkId: data.id },
          create: {
            clerkId: data.id,
            email: primaryEmail?.email_address ?? '',
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
          },
          update: {
            email: primaryEmail?.email_address ?? '',
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
          },
        })
        console.log(`[Webhook] User created: ${data.id}`)
        break
      }

      case 'user.updated': {
        const primaryEmail = data.email_addresses?.find(
          (e: { id: string; email_address: string }) => e.id === data.primary_email_address_id
        )
        await prisma.user.updateMany({
          where: { clerkId: data.id },
          data: {
            email: primaryEmail?.email_address ?? '',
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
          },
        })
        console.log(`[Webhook] User updated: ${data.id}`)
        break
      }

      case 'user.deleted': {
        await prisma.user.updateMany({
          where: { clerkId: data.id },
          data: { isActive: false },
        })
        console.log(`[Webhook] User deleted: ${data.id}`)
        break
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('[Webhook] Processing error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

export default router
