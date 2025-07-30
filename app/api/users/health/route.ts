import { NextResponse } from "next/server"
import { getUserDatabase } from "@/lib/real-time-user-db"

const userDb = getUserDatabase()

export async function GET() {
  try {
    const health = await userDb.healthCheck()

    return NextResponse.json({
      success: true,
      health,
      timestamp: new Date(),
      version: "1.0.0",
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Health check failed",
        timestamp: new Date(),
      },
      { status: 500 },
    )
  }
}
