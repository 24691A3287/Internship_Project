import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing headers' }, { status: 400 })
  }

  const body = await req.text()

  try {
    const wh = new Webhook(webhookSecret)
    wh.verify(body, { 'svix-id': svixId, 'svix-timestamp': svixTimestamp, 'svix-signature': svixSignature })

    const apiUrl = process.env.API_URL ?? 'http://localhost:4000'
    await fetch(`${apiUrl}/api/webhooks/clerk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'svix-id': svixId, 'svix-timestamp': svixTimestamp, 'svix-signature': svixSignature },
      body,
    })

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })
  }
}
