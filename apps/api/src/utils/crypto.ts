import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export function generateApiKey(): { key: string; prefix: string } {
  const key = `qrp_${crypto.randomBytes(32).toString('hex')}`
  const prefix = key.substring(0, 12)
  return { key, prefix }
}

export async function hashApiKey(key: string): Promise<string> {
  return bcrypt.hash(key, 10)
}

export async function verifyApiKey(key: string, hash: string): Promise<boolean> {
  return bcrypt.compare(key, hash)
}

export function generateShortCode(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  const bytes = crypto.randomBytes(length)
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length]
  }
  return result
}
