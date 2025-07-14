import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Database connection
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Create the connection
const client = postgres(connectionString, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
})

// Create Drizzle database instance
export const db = drizzle(client, { schema })

// Connection health check
export async function checkDatabaseConnection() {
  try {
    await client`SELECT 1`
    return { healthy: true, message: "Database connection successful" }
  } catch (error) {
    console.error("Database connection failed:", error)
    return { healthy: false, message: "Database connection failed", error }
  }
}

// Close connection (for cleanup)
export async function closeDatabaseConnection() {
  await client.end()
}
