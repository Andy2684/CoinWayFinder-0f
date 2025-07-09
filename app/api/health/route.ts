import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "ioredis"
import { connectToDatabase } from "../../../lib/database"

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy" | "warning" | "error"
  timestamp: string
  environment: string
  uptime: number
  version: string
  services: {
    database: "connected" | "not_configured" | "error"
    redis: "connected" | "not_configured" | "error"
    stripe: "configured" | "not_configured"
    openai: "configured" | "not_configured"
  }
  responseTime: string
  checks: {
    server: string
    memory: string
    environment: string
  }
}

async function checkDatabase(): Promise<string> {
  try {
    if (!process.env.MONGODB_URI) {
      return "not_configured"
    }

    const db = await connectToDatabase()
    await db.admin().ping()

    return "connected"
  } catch (error) {
    return "error"
  }
}

async function checkRedis(): Promise<string> {
  try {
    if (!process.env.REDIS_URL) {
      return "not_configured"
    }

    const redis = new Redis(process.env.REDIS_URL)
    await redis.ping()
    redis.disconnect()

    return "connected"
  } catch (error) {
    return "error"
  }
}

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()

    const databaseStatus = await checkDatabase()
    const redisStatus = await checkRedis()

    const externalServices = {
      database: databaseStatus,
      redis: redisStatus,
      stripe: process.env.STRIPE_SECRET_KEY ? "configured" : "not_configured",
      openai: process.env.OPENAI_API_KEY ? "configured" : "not_configured",
    }

    let status: HealthStatus["status"] = "healthy"
    if (databaseStatus === "error" || redisStatus === "error") {
      status = "unhealthy"
    } else if (databaseStatus === "not_configured") {
      status = "warning"
    }

    const responseTime = Date.now() - startTime

    const healthData: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      uptime: responseTime,
      version: process.env.npm_package_version || "1.0.0",
      services: externalServices,
      responseTime: `${responseTime}ms`,
      checks: {
        server: "✅ Server is running",
        memory: `✅ Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        environment: `✅ Environment: ${process.env.NODE_ENV || "development"}`,
      },
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
    console.error("Health check error:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function HEAD(request: NextRequest) {
  // Simple HEAD request for basic health check
  return new NextResponse(null, { status: 200 })
}
