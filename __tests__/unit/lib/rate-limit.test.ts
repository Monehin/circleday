import { describe, it, expect, beforeEach } from 'vitest'
import { RATE_LIMITS } from '@/lib/rate-limit/config'

describe('Rate Limit Configuration', () => {
  it('should have auth rate limits defined', () => {
    expect(RATE_LIMITS.auth.login).toEqual({ limit: 5, window: '1 m' })
    expect(RATE_LIMITS.auth.magicLink).toEqual({ limit: 3, window: '15 m' })
    expect(RATE_LIMITS.auth.smsOtp).toEqual({ limit: 5, window: '1 h' })
  })

  it('should have API rate limits defined', () => {
    expect(RATE_LIMITS.api.authenticated).toEqual({ limit: 100, window: '1 m' })
    expect(RATE_LIMITS.api.unauthenticated).toEqual({ limit: 20, window: '1 m' })
  })

  it('should have public endpoint rate limits', () => {
    expect(RATE_LIMITS.public.wishWall).toEqual({ limit: 10, window: '1 m' })
    expect(RATE_LIMITS.public.giftPage).toEqual({ limit: 30, window: '1 m' })
  })

  it('should have webhook rate limits (higher)', () => {
    expect(RATE_LIMITS.webhooks.stripe.limit).toBe(1000)
    expect(RATE_LIMITS.webhooks.twilio.limit).toBe(1000)
    expect(RATE_LIMITS.webhooks.resend.limit).toBe(1000)
  })
})

describe('Rate Limit Helpers', () => {
  it('should export rate limit configuration type', () => {
    // Type check - this will fail at compile time if types are wrong
    const config: typeof RATE_LIMITS = RATE_LIMITS
    expect(config).toBeDefined()
  })
})

