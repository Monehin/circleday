export async function GET() {
  return Response.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      env: process.env.NODE_ENV || 'development',
      services: {
        database: 'pending', // Will implement after Prisma setup
        queue: 'pending', // Will implement after QStash setup
      },
    },
    { status: 200 }
  )
}

