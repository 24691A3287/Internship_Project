import { Request, Response, NextFunction } from 'express'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { env } from '../config/env'
import { ApiResponse } from '../utils/apiResponse'

// Only initialize if credentials are present
const ratelimit =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: new Redis({
          url: env.UPSTASH_REDIS_REST_URL,
          token: env.UPSTASH_REDIS_REST_TOKEN,
        }),
        limiter: Ratelimit.slidingWindow(100, '1 m'),
        analytics: true,
      })
    : null

const strictRatelimit =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: new Redis({
          url: env.UPSTASH_REDIS_REST_URL,
          token: env.UPSTASH_REDIS_REST_TOKEN,
        }),
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        analytics: true,
      })
    : null

export function rateLimiter(strict = false) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const limiter = strict ? strictRatelimit : ratelimit
    if (!limiter) {
      // No rate limiting configured, pass through
      next()
      return
    }

    const identifier = req.user?.id ?? req.ip ?? 'anonymous'
    const { success, limit, remaining, reset } = await limiter.limit(identifier)

    res.setHeader('X-RateLimit-Limit', limit)
    res.setHeader('X-RateLimit-Remaining', remaining)
    res.setHeader('X-RateLimit-Reset', new Date(reset).toISOString())

    if (!success) {
      res.status(429).json({
        success: false,
        error: 'Too many requests. Please slow down.',
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      })
      return
    }

    next()
  }
}
