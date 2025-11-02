export const RATE_LIMITS = {
  // Auth endpoints
  auth: {
    login: { limit: 5, window: '1 m' }, // 5 per minute per IP
    magicLink: { limit: 3, window: '15 m' }, // 3 per 15 minutes per email
    smsOtp: { limit: 5, window: '1 h' }, // 5 per hour per phone
  },
  // API endpoints
  api: {
    authenticated: { limit: 100, window: '1 m' }, // 100 per minute per user
    unauthenticated: { limit: 20, window: '1 m' }, // 20 per minute per IP
  },
  // Public endpoints
  public: {
    wishWall: { limit: 10, window: '1 m' }, // 10 posts per minute per IP
    giftPage: { limit: 30, window: '1 m' }, // 30 views per minute per IP
  },
  // Webhooks (higher limit)
  webhooks: {
    stripe: { limit: 1000, window: '1 m' },
    twilio: { limit: 1000, window: '1 m' },
    resend: { limit: 1000, window: '1 m' },
  },
} as const

export type RateLimitConfig = typeof RATE_LIMITS

