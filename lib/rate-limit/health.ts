import { Redis } from '@upstash/redis'

/**
 * Check Upstash Redis connection for rate limiting
 */
export async function checkRateLimitConnection(): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return false // Not configured
  }

  try {
    const redis = new Redis({ url, token })
    
    // Simple ping
    const result = await redis.ping()
    
    return result === 'PONG'
  } catch (error) {
    console.error('Upstash Redis health check failed:', error)
    return false
  }
}

