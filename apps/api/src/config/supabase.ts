import { createClient } from '@supabase/supabase-js'
import { env } from './env'

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('\u26a0\ufe0f  Supabase credentials not configured. File uploads will be disabled.')
}

export const supabase = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null

export const STORAGE_BUCKET = 'qr-assets'
