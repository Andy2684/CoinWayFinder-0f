import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"

export async function POST() {
  try {
    // Check if user is admin (optional security check)
    const user = await getCurrentUser()
    if (user) {
      // You could add admin check here if needed
      console.log("Database initialization requested by user:", user.email)
    }

    console.log("Initializing database...")
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
