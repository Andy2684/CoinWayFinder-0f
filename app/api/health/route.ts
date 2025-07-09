import { type NextRequest, NextResponse } from "next/server"

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  environment: string
  uptime: number
  version: string
  checks: {
    database: {
      status: "connected" | "disconnected" | "error"
      responseTime?: number
      error?: string
    }
    redis: {
      status: "connected" | "disconnected" | "error"
      responseTime?: number
      error?: string
    }
    external_apis: {
      status: "operational" | "degraded" | "down"
      services: {
        stripe: boolean
        openai: boolean
        crypto_apis: boolean
      }
    }
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
}

async function checkDatabase(): Promise<HealthStatus["checks"]["database"]> {
  try {
    const startTime = Date.now()

    // Try to import and use the database connection
    const { connectToDatabase } = await import("../../../lib/database")
    const db = await connectToDatabase()

    // Simple ping test
    await db.admin().ping()

    return {
      status: "connected",
      responseTime: Date.now() - startTime,
    }
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}

async function checkRedis(): Promise<HealthStatus["checks"]["redis"]> {
  try {
    if (!process.env.Redis_URL) {
      return {
        status: "disconnected",
        error: "Redis URL not configured",
      }
    }

    const startTime = Date.now()

    // Try to create a Redis connection
    const { Redis } = await import("ioredis")
    const redis = new Redis(process.env.Redis_URL)

    await redis.ping()
    redis.disconnect()

    return {
      status: "connected",
      responseTime: Date.now() - startTime,
    }
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown Redis error",
    }
  }
}

async function checkExternalAPIs(): Promise<HealthStatus["checks"]["external_apis"]> {
  const services = {
    stripe: !!process.env.STRIPE_SECRET_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    crypto_apis: true, // We'll assume crypto APIs are working if no specific key is required
  }

  const operationalCount = Object.values(services).filter(Boolean).length
  const totalServices = Object.values(services).length

  return {
    status: operationalCount === totalServices ? "operational" : operationalCount > 0 ? "degraded" : "down",
    services,
  }
}

function getMemoryUsage(): HealthStatus["memory"] {
  if (typeof process !== "undefined" && process.memoryUsage) {
    const usage = process.memoryUsage()
    const used = usage.heapUsed
    const total = usage.heapTotal

    return {
      used: Math.round(used / 1024 / 1024), // MB
      total: Math.round(total / 1024 / 1024), // MB
      percentage: Math.round((used / total) * 100),
    }
  }

  return {
    used: 0,
    total: 0,
    percentage: 0,
  }
}

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()

    // Run health checks in parallel
    const [databaseCheck, redisCheck, externalAPIsCheck] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkExternalAPIs(),
    ])

    const memory = getMemoryUsage()

    // Determine overall health status
    let overallStatus: HealthStatus["status"] = "healthy"

    if (databaseCheck.status === "error") {
      overallStatus = "unhealthy"
    } else if (redisCheck.status === "error" || externalAPIsCheck.status === "down" || memory.percentage > 90) {
      overallStatus = "degraded"
    }

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      uptime: Date.now() - startTime,
      version: process.env.npm_package_version || "1.0.0",
      checks: {
        database: databaseCheck,
        redis: redisCheck,
        external_apis: externalAPIsCheck,
      },
      memory,
    }

    // Return appropriate HTTP status based on health
    const httpStatus = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503

    return NextResponse.json(healthStatus, { status: httpStatus })
  } catch (error) {
    console.error("Health check error:", error)

    const errorStatus: HealthStatus = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      uptime: 0,
      version: "unknown",
      checks: {
        database: {
          status: "error",
          error: "Health check failed",
        },
        redis: {
          status: "error",
          error: "Health check failed",
        },
        external_apis: {
          status: "down",
          services: {
            stripe: false,
            openai: false,
            crypto_apis: false,
          },
        },
      },
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
      },
    }

    return NextResponse.json(errorStatus, { status: 503 })
  }
}
