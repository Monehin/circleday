import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { magicLink } from 'better-auth/plugins'
import { db } from '@/lib/db'
import { sendMagicLinkEmail } from '@/lib/email/magic-link'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
  
  emailAndPassword: {
    enabled: false, // We use magic links only
  },
  
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url, token }: { email: string; url: string; token: string }) => {
        await sendMagicLinkEmail(email, url, token)
      },
    }),
  ],
  
  session: {
    expiresIn: 60 * 60 * 24 * 2, // 2 days idle timeout
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: process.env.NODE_ENV === 'production',
      maxAge: 60 * 2, // 2 minutes in production for tighter idle detection
    },
  },
  
  advanced: {
    cookiePrefix: 'circleday',
    useSecureCookies: process.env.NODE_ENV === 'production',
    // Allow cookies to work on both www and non-www
    crossSubDomainCookies: {
      enabled: true,
      // For circleday.app to work on both www.circleday.app and circleday.app
      domain: process.env.NODE_ENV === 'production' ? '.circleday.app' : undefined,
    },
  },
  
  user: {
    additionalFields: {
      defaultTimezone: {
        type: 'string',
        required: false,
        defaultValue: 'UTC',
      },
      phoneVerified: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
    },
  },
  
  // Rate limiting handled by our Upstash integration
  rateLimit: {
    enabled: false, // We handle this separately
  },
  
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'https://circleday.app',
    'https://www.circleday.app',
  ],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user


