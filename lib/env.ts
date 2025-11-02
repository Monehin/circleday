import { z } from 'zod'

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // App URLs
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SHORT_DOMAIN: z.string().default('localhost:3000'),
  
  // Database (optional for now, required when Prisma is set up)
  DATABASE_URL: z.string().url().optional(),
  DIRECT_URL: z.string().url().optional(),
  
  // Auth (optional for now, required when Better Auth is set up)
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  
  // Feature flags
  ENABLE_SMS: z.string().default('false'),
  ENABLE_GIFTING: z.string().default('false'),
  ENABLE_POTS: z.string().default('false'),
})

export type Env = z.infer<typeof envSchema>

// Validate environment variables
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    console.error(parsed.error.flatten().fieldErrors)
    throw new Error('Invalid environment variables')
  }
  
  return parsed.data
}

// Export validated env
export const env = validateEnv()

// Helper to check if a feature is enabled
export function isFeatureEnabled(feature: keyof Pick<Env, 'ENABLE_SMS' | 'ENABLE_GIFTING' | 'ENABLE_POTS'>): boolean {
  return env[feature] === 'true'
}

