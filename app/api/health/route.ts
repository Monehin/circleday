import { checkDatabaseConnection } from '@/lib/db'
import { checkRateLimitConnection } from '@/lib/rate-limit/health'

export async function GET() {
  // Check all services
  const checks = await Promise.all([
    process.env.DATABASE_URL ? checkDatabaseConnection() : Promise.resolve(null),
    checkRateLimitConnection(),
  ])

  const [dbHealthy, rateLimitHealthy] = checks
  
  // System is healthy if database is healthy (critical service)
  const allHealthy = dbHealthy !== false
  
  const getServiceStatus = (healthy: boolean | null) => {
    if (healthy === null) return 'not_configured'
    return healthy ? 'healthy' : 'unhealthy'
  }
  
  return Response.json(
    {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      env: process.env.NODE_ENV || 'development',
      services: {
        database: getServiceStatus(dbHealthy),
        rateLimit: getServiceStatus(rateLimitHealthy),
      },
    },
    { status: allHealthy ? 200 : 503 }
  )
}

