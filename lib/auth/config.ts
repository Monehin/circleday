import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { magicLink } from 'better-auth/plugins'
import { db } from '@/lib/db'
import { sendMagicLinkEmail } from '@/lib/email/magic-link'

export const auth = betterAuth({
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
    expiresIn: 60 * 60 * 24 * 30, // 30 days idle timeout
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // Cache for 5 minutes
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
  ],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user


