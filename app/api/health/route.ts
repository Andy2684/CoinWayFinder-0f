import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    const dbHealthy = await database.healthCheck()

    // Check environment variables
    const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "NEXT_PUBLIC_BASE_URL"]

    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbHealthy ? "connected" : "disconnected",
      environment: process.env.NODE_ENV || "development",
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : undefined,
    }

    const statusCode = dbHealthy && missingEnvVars.length === 0 ? 200 : 503

    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    )
  }
}
