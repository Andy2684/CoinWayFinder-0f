import { NextResponse } from "next/server"
import { checkDatabaseHealth } from "@/lib/mongodb"

export async function GET() {
  try {
    const isHealthy = await checkDatabaseHealth()

    if (isHealthy) {
      return NextResponse.json({
        status: "healthy",
        message: "Database connection is working properly",
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          status: "unhealthy",
          message: "Database connection failed",
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      )
    }
  } catch (error) {
    console.error("Database health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
