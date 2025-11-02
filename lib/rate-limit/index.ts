import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { AppError } from '@/lib/errors/error-handler'
import { ErrorCode } from '@/lib/errors/error-types'

// Initialize Redis client
let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    // In development without Upstash, return null (rate limiting disabled)
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Upstash not configured - rate limiting disabled in development')
      return null
    }
    throw new Error('Upstash Redis credentials not configured')
  }

  redis = new Redis({ url, token })
  return redis
}

// Simple rate limit check function
export async function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 60
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const redisClient = getRedis()

  // Skip rate limiting in development if Upstash not configured
  if (!redisClient) {
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + windowSeconds * 1000,
    }
  }

  // Create rate limiter
  const ratelimit = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    analytics: true,
    prefix: 'circleday',
  })

  const result = await ratelimit.limit(identifier)

  if (!result.success) {
    throw new AppError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      `Rate limit exceeded. Try again in ${Math.ceil((result.reset - Date.now()) / 1000)}s`,
      429,
      { limit: result.limit, reset: result.reset }
    )
  }

  return result
}

// Helper for API routes with predefined limits
export async function withRateLimit<T>(
  identifier: string,
  limit: number,
  windowSeconds: number,
  handler: () => Promise<T>
): Promise<T> {
  await checkRateLimit(identifier, limit, windowSeconds)
  return handler()
}

// Get client IP from request
export function getClientIp(request: Request): string {
  // Check various headers for IP (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  if (realIp) return realIp
  if (cfConnectingIp) return cfConnectingIp

  return 'unknown'
}

