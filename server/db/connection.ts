import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "../config/index";
import * as schema from "./schema";

// Create PostgreSQL connection
const connectionString = config.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString, {
  max: 20, // Maximum number of connections in the pool
  idle_timeout: 30, // Close idle connections after 30 seconds
  connect_timeout: 10, // Connection timeout in seconds
  ssl: config.NODE_ENV === "production" ? "require" : "prefer",
});

// Create Drizzle database instance
export const db = drizzle(client, {
  schema,
  // logger: config.NODE_ENV === 'development',
});

// Test connection function
export async function testConnection(): Promise<boolean> {
  try {
    await client`SELECT 1 as test`;
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Close connection
export async function closeConnection(): Promise<void> {
  await client.end();
}
