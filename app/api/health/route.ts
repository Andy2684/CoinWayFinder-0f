import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Basic health checks
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
      checks: {
        server: "healthy",
        memory: "healthy",
        environment: "healthy",
      },
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage()
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    }

    // Check if memory usage is concerning
    if (memoryUsageMB.heapUsed > 500) {
      health.checks.memory = "warning"
      health.status = "warning"
    }

    // Check environment variables
    const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "NEXTAUTH_SECRET"]

    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

    if (missingEnvVars.length > 0) {
      health.checks.environment = "warning"
      health.status = "warning"
    }

    const responseTime = Date.now() - startTime

    return NextResponse.json(
      {
        ...health,
        memory: memoryUsageMB,
        responseTime: `${responseTime}ms`,
        missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : undefined,
      },
      { status: 200 },
    )
  } catch (error) {
    const responseTime = Date.now() - startTime

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: `${responseTime}ms`,
      },
      { status: 500 },
    )
  }
}
