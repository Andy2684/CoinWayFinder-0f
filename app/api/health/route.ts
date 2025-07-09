import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Basic health check
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node: process.version,
    }

    // Check environment variables
    const requiredEnvVars = ["JWT_SECRET", "NEXTAUTH_SECRET", "NEXT_PUBLIC_BASE_URL"]

    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        {
          ...health,
          status: "warning",
          issues: [`Missing environment variables: ${missingEnvVars.join(", ")}`],
        },
        { status: 200 },
      )
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
