import { testConnection } from '../../../server/db/connection'

export async function loader() {
  try {
    const isDbHealthy = await testConnection()

    const healthStatus = {
      status: isDbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: isDbHealthy ? 'connected' : 'disconnected',
      uptime: process.uptime(),
    }
    return new Response(
      `Status: ${healthStatus.status}\nDatabase: ${healthStatus.database}\nTimestamp: ${healthStatus.timestamp}\nUptime: ${healthStatus.uptime}s`,
      {
        status: isDbHealthy ? 200 : 503,
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    )
  } catch (error) {
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime(),
    }

    return errorResponse
  }
}
