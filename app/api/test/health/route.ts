import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test database connection
    const result = await sql`SELECT 1 as test`

    // Test environment variables
    const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "NEXTAUTH_SECRET"]

    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: result ? "connected" : "disconnected",
      environment: {
        nodeEnv: process.env.NODE_ENV,
        missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : null,
      },
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
