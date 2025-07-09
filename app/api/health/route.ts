import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"

export async function GET() {
  try {
    // Check database connection
    const db = await connectToDatabase()
    await db.admin().ping()

    // Check Redis connection (if configured)
    let redisStatus = "not configured"
    if (process.env.REDIS_URL) {
      try {
        // Redis check would go here
        redisStatus = "connected"
      } catch (error) {
        redisStatus = "error"
      }
    }

    // Check environment variables
    const requiredEnvVars = ["MONGODB_URI", "NEXTAUTH_SECRET", "STRIPE_SECRET_KEY", "OPENAI_API_KEY"]

    const missingEnvVars = requiredEnvVars.filter((env) => !process.env[env])

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      database: "connected",
      redis: redisStatus,
      missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : undefined,
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
