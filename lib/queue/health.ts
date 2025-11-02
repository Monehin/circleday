/**
 * QStash Health Check
 */
export async function checkQStashConnection(): Promise<boolean> {
  const url = process.env.QSTASH_URL
  const token = process.env.QSTASH_TOKEN

  if (!url || !token) {
    return false // Not configured
  }

  try {
    // Ensure URL has /v2 path
    const baseUrl = url.endsWith('/v2') ? url : `${url}/v2`
    
    // Simple ping to QStash API - just check if service is reachable
    const response = await fetch(`${baseUrl}/messages`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Any response (including 405 Method Not Allowed) means service is reachable
    // 200, 401, 405 all indicate QStash is operational
    return response.status < 500
  } catch (error) {
    console.error('QStash health check failed:', error)
    return false
  }
}

