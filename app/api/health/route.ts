import { checkDatabaseConnection } from '@/lib/db'

export async function GET() {
  // Check database connection
  const dbHealthy = process.env.DATABASE_URL 
    ? await checkDatabaseConnection()
    : null
  
  const allHealthy = dbHealthy !== false
  
  return Response.json(
    {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      env: process.env.NODE_ENV || 'development',
      services: {
        database: dbHealthy === null ? 'not_configured' : (dbHealthy ? 'healthy' : 'unhealthy'),
        queue: 'not_configured', // Will implement after QStash setup
      },
    },
    { status: allHealthy ? 200 : 503 }
  )
}

