# Rate Limiting Guide

## Overview

CircleDay uses Upstash Rate Limit for protecting endpoints from abuse.

## Configuration

Rate limits are defined in `lib/rate-limit/index.ts` using sliding windows backed by Upstash Redis:

```typescript
// Example defaults inside the helper
const limit = 100
const windowSeconds = 60
```

## Setup

### 1. Create Upstash Account

1. Go to <https://upstash.com>
2. Sign up / Log in
3. Create Redis database:
   - Name: `circleday-ratelimit`
   - Region: Choose closest to your users
   - Type: Regional (free tier)

### 2. Get Credentials

Copy from Upstash dashboard:

- REST URL
- REST TOKEN

### 3. Add to Environment

```bash
# .env.local
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_token_here"
```

## Usage

### In API Routes

```typescript
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = getClientIp(request)
  
  // Check rate limit
  await checkRateLimit(ip, 100, 60)
  
  // Continue with request handling...
}
```

### In Server Actions

```typescript
import { withRateLimit } from '@/lib/rate-limit'

export async function loginAction(email: string) {
  return withRateLimit(email, 5, 60, async () => {
    // Your logic here
    return { success: true }
  })
}
```

## Development Mode

Rate limiting is **disabled by default** in development if Upstash is not configured.

You'll see: `⚠️  Upstash not configured - rate limiting disabled in development`

## Production

In production, rate limiting is **required**. The app will throw an error if Upstash credentials are missing.

## Testing

Rate limit configuration is tested in `__tests__/unit/lib/rate-limit.test.ts`

## Error Handling

When rate limit is exceeded:

- HTTP Status: 429 (Too Many Requests)
- Error Code: RATE_LIMIT_EXCEEDED
- Message includes reset time

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 45s"
  }
}
```

## Monitoring

Rate limit analytics are enabled and can be viewed in Upstash dashboard.
