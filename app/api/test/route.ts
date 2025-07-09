import { type NextRequest, NextResponse } from "next/server"

interface ComponentTest {
  name: string
  status: "healthy" | "warning" | "error"
  message: string
  details?: any
  responseTime?: number
}

interface TestSuite {
  status: "healthy" | "degraded" | "critical"
  timestamp: string
  tests: ComponentTest[]
  summary: {
    total: number
    healthy: number
    warnings: number
    errors: number
  }
  environment: {
    nodeEnv: string
    platform: string
    nodeVersion: string
  }
}

async function testDatabaseConnection(): Promise<ComponentTest> {
  const startTime = Date.now()

  try {
    const { connectToDatabase } = await import("../../../lib/database")
    const db = await connectToDatabase()

    // Test basic operations
    await db.admin().ping()

    // Test collection access
    const collections = await db.listCollections().toArray()

    return {
      name: "MongoDB Database",
      status: "healthy",
      message: `Connected successfully. Found ${collections.length} collections.`,
      responseTime: Date.now() - startTime,
      details: {
        collections: collections.map((c) => c.name),
      },
    }
  } catch (error) {
    return {
      name: "MongoDB Database",
      status: "error",
      message: error instanceof Error ? error.message : "Database connection failed",
      responseTime: Date.now() - startTime,
    }
  }
}

async function testRedisConnection(): Promise<ComponentTest> {
  const startTime = Date.now()

  try {
    if (!process.env.Redis_URL) {
      return {
        name: "Redis Cache",
        status: "warning",
        message: "Redis URL not configured - caching disabled",
        responseTime: Date.now() - startTime,
      }
    }

    const { Redis } = await import("ioredis")
    const redis = new Redis(process.env.Redis_URL)

    await redis.ping()

    // Test basic operations
    await redis.set("health-check", "ok", "EX", 60)
    const result = await redis.get("health-check")

    redis.disconnect()

    return {
      name: "Redis Cache",
      status: "healthy",
      message: "Connected and operational",
      responseTime: Date.now() - startTime,
      details: {
        testResult: result,
      },
    }
  } catch (error) {
    return {
      name: "Redis Cache",
      status: "error",
      message: error instanceof Error ? error.message : "Redis connection failed",
      responseTime: Date.now() - startTime,
    }
  }
}

async function testEnvironmentVariables(): Promise<ComponentTest> {
  const startTime = Date.now()

  const requiredVars = ["MONGODB_URI", "JWT_SECRET", "NEXTAUTH_SECRET"]

  const optionalVars = ["Redis_URL", "STRIPE_SECRET_KEY", "OPENAI_API_KEY", "STRIPE_PUBLISHABLE_KEY"]

  const missing = requiredVars.filter((varName) => !process.env[varName])
  const presentOptional = optionalVars.filter((varName) => !!process.env[varName])

  if (missing.length > 0) {
    return {
      name: "Environment Variables",
      status: "error",
      message: `Missing required variables: ${missing.join(", ")}`,
      responseTime: Date.now() - startTime,
      details: {
        missing,
        presentOptional,
      },
    }
  }

  return {
    name: "Environment Variables",
    status: "healthy",
    message: `All required variables present. ${presentOptional.length}/${optionalVars.length} optional variables configured.`,
    responseTime: Date.now() - startTime,
    details: {
      requiredCount: requiredVars.length,
      optionalCount: presentOptional.length,
      presentOptional,
    },
  }
}

async function testStripeIntegration(): Promise<ComponentTest> {
  const startTime = Date.now()

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        name: "Stripe Integration",
        status: "warning",
        message: "Stripe not configured - payments disabled",
        responseTime: Date.now() - startTime,
      }
    }

    const stripe = await import("stripe")
    const stripeClient = new stripe.default(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })

    // Test basic Stripe connection
    const account = await stripeClient.accounts.retrieve()

    return {
      name: "Stripe Integration",
      status: "healthy",
      message: "Stripe connected successfully",
      responseTime: Date.now() - startTime,
      details: {
        accountId: account.id,
        country: account.country,
      },
    }
  } catch (error) {
    return {
      name: "Stripe Integration",
      status: "error",
      message: error instanceof Error ? error.message : "Stripe connection failed",
      responseTime: Date.now() - startTime,
    }
  }
}

async function testAuthSystem(): Promise<ComponentTest> {
  const startTime = Date.now()

  try {
    // Test if auth endpoints are accessible
    const authModule = await import("../../../lib/auth")

    if (!process.env.JWT_SECRET || !process.env.NEXTAUTH_SECRET) {
      return {
        name: "Authentication System",
        status: "error",
        message: "Auth secrets not configured",
        responseTime: Date.now() - startTime,
      }
    }

    return {
      name: "Authentication System",
      status: "healthy",
      message: "Auth system configured correctly",
      responseTime: Date.now() - startTime,
    }
  } catch (error) {
    return {
      name: "Authentication System",
      status: "warning",
      message: "Auth module could not be loaded",
      responseTime: Date.now() - startTime,
    }
  }
}

async function testCryptoAPIs(): Promise<ComponentTest> {
  const startTime = Date.now()

  try {
    // Test a simple crypto API call
    const response = await fetch("https://api.coingecko.com/api/v3/ping", {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API returned ${response.status}`)
    }

    const data = await response.json()

    return {
      name: "Crypto APIs",
      status: "healthy",
      message: "External crypto APIs accessible",
      responseTime: Date.now() - startTime,
      details: {
        coingecko: data,
      },
    }
  } catch (error) {
    return {
      name: "Crypto APIs",
      status: "warning",
      message: "External crypto APIs may be unreachable",
      responseTime: Date.now() - startTime,
    }
  }
}

async function testOpenAI(): Promise<ComponentTest> {
  const startTime = Date.now()

  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        name: "OpenAI Integration",
        status: "warning",
        message: "OpenAI API key not configured - AI features disabled",
        responseTime: Date.now() - startTime,
      }
    }

    // Just check if the key is formatted correctly
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey.startsWith("sk-")) {
      return {
        name: "OpenAI Integration",
        status: "warning",
        message: "OpenAI API key format appears invalid",
        responseTime: Date.now() - startTime,
      }
    }

    return {
      name: "OpenAI Integration",
      status: "healthy",
      message: "OpenAI API key configured",
      responseTime: Date.now() - startTime,
    }
  } catch (error) {
    return {
      name: "OpenAI Integration",
      status: "error",
      message: error instanceof Error ? error.message : "OpenAI check failed",
      responseTime: Date.now() - startTime,
    }
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log("🧪 Running comprehensive test suite...")

    // Run all tests in parallel
    const tests = await Promise.all([
      testEnvironmentVariables(),
      testDatabaseConnection(),
      testRedisConnection(),
      testAuthSystem(),
      testStripeIntegration(),
      testCryptoAPIs(),
      testOpenAI(),
    ])

    // Calculate summary
    const summary = {
      total: tests.length,
      healthy: tests.filter((t) => t.status === "healthy").length,
      warnings: tests.filter((t) => t.status === "warning").length,
      errors: tests.filter((t) => t.status === "error").length,
    }

    // Determine overall status
    let overallStatus: TestSuite["status"] = "healthy"
    if (summary.errors > 0) {
      overallStatus = "critical"
    } else if (summary.warnings > 0) {
      overallStatus = "degraded"
    }

    const testSuite: TestSuite = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      tests,
      summary,
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        platform: process.platform || "unknown",
        nodeVersion: process.version || "unknown",
      },
    }

    console.log(`📊 Test completed in ${Date.now() - startTime}ms`)
    console.log(`✅ ${summary.healthy}/${summary.total} tests passed`)

    // Return appropriate status code
    const httpStatus = overallStatus === "critical" ? 500 : 200

    return NextResponse.json(testSuite, { status: httpStatus })
  } catch (error) {
    console.error("Test suite execution failed:", error)

    const errorResponse: TestSuite = {
      status: "critical",
      timestamp: new Date().toISOString(),
      tests: [
        {
          name: "Test Suite Execution",
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
          responseTime: Date.now() - startTime,
        },
      ],
      summary: {
        total: 1,
        healthy: 0,
        warnings: 0,
        errors: 1,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        platform: process.platform || "unknown",
        nodeVersion: process.version || "unknown",
      },
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
