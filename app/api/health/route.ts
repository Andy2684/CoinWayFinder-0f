import { NextResponse } from "next/server"

export async function GET() {
  const startTime = Date.now()

  try {
    // Basic system checks
    const memory = process.memoryUsage()
    const uptime = process.uptime()

    // Environment checks
    const requiredEnvVars = ["JWT_SECRET", "NEXTAUTH_SECRET"]
    const optionalEnvVars = ["MONGODB_URI", "REDIS_URL", "STRIPE_SECRET_KEY", "OPENAI_API_KEY"]

    const missingRequired = requiredEnvVars.filter((env) => !process.env[env])
    const missingOptional = optionalEnvVars.filter((env) => !process.env[env])

    // Determine health status
    let status = "healthy"
    const issues = []

    if (missingRequired.length > 0) {
      status = "unhealthy"
      issues.push(`Missing required environment variables: ${missingRequired.join(", ")}`)
    } else if (missingOptional.length > 0) {
      status = "warning"
      issues.push(`Missing optional environment variables: ${missingOptional.join(", ")}`)
    }

    // Memory check
    const memoryUsageMB = memory.heapUsed / 1024 / 1024
    if (memoryUsageMB > 200) {
      status = status === "healthy" ? "warning" : status
      issues.push(`High memory usage: ${Math.round(memoryUsageMB)}MB`)
    }

    const responseTime = Date.now() - startTime

    const healthData = {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      responseTime,
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      memory: {
        used: Math.round(memoryUsageMB),
        total: Math.round(memory.heapTotal / 1024 / 1024),
        external: Math.round(memory.external / 1024 / 1024),
      },
      services: {
        database: process.env.MONGODB_URI ? "configured" : "not configured",
        redis: process.env.REDIS_URL ? "configured" : "not configured",
        stripe: process.env.STRIPE_SECRET_KEY ? "configured" : "not configured",
        openai: process.env.OPENAI_API_KEY ? "configured" : "not configured",
      },
      issues: issues.length > 0 ? issues : undefined,
    }

    return NextResponse.json(healthData, {
      status: status === "unhealthy" ? 503 : 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: Date.now() - startTime,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  }
}
