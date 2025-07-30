import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/mongodb"

export async function POST() {
  try {
    await initializeDatabase()

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Database initialization failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
