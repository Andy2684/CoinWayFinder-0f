import { NextResponse } from "next/server"
import { checkDatabaseHealth, connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("Checking database health...")

    const isHealthy = await checkDatabaseHealth()

    if (isHealthy) {
      // Get additional database info
      const { db } = await connectToDatabase()
      const collections = await db.listCollections().toArray()

      return NextResponse.json({
        success: true,
        status: "healthy",
        message: "Database connection is working properly",
        details: {
          connected: true,
          collections: collections.map((col) => col.name),
          timestamp: new Date().toISOString(),
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          status: "unhealthy",
          message: "Database connection failed",
          details: {
            connected: false,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 503 },
      )
    }
  } catch (error) {
    console.error("Database health check error:", error)

    return NextResponse.json(
      {
        success: false,
        status: "error",
        message: "Database health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
        details: {
          connected: false,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    )
  }
}
