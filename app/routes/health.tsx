import type { Route } from "../+types/root";
import { testConnection } from "../../server/db/connection";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    console.log("Health check started");
    const isDbHealthy = await testConnection();
    console.log("Health check completed");
    const healthStatus = {
      status: isDbHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      database: isDbHealthy ? "connected" : "disconnected",
      uptime: process.uptime(),
    };
    return new Response(
      `Status: ${healthStatus.status}\nDatabase: ${healthStatus.database}\nTimestamp: ${healthStatus.timestamp}\nUptime: ${healthStatus.uptime}s`,
      {
        status: isDbHealthy ? 200 : 503,
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );
  } catch (error) {
    const errorResponse = {
      status: "error",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      uptime: process.uptime(),
    };

    return errorResponse;
  }
}

export default function Health() {
  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Health Check</h1>
      <p>This endpoint tests the database connection.</p>
      <p>
        Use <code>?format=text</code> for plain text response.
      </p>
    </div>
  );
}
