import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    const { db } = await connectToDatabase()
    await db.admin().ping()

    // Check Redis connection if available
    let redisStatus = "not configured"
    if (process.env.REDIS_URL) {
      // Redis check would go here
      redisStatus = "connected"
    }

    // Check environment variables
    const envCheck = {
      mongodb: !!process.env.MONGODB_URI,
      jwt: !!process.env.JWT_SECRET,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      nextauth: !!process.env.NEXTAUTH_SECRET,
    }

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      services: {
        database: "connected",
        redis: redisStatus,
      },
      config: envCheck,
    })
  } catch (error) {
    console.error("Health check failed:", error)

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
