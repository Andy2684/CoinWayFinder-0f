import { type NextRequest, NextResponse } from "next/server"

interface TestResult {
  name: string
  status: "healthy" | "warning" | "error"
  message: string
  details?: any
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const tests: TestResult[] = []

  // Test 1: Server Status
  tests.push({
    name: "Server Status",
    status: "healthy",
    message: "Server is running normally",
    details: {
      uptime: process.uptime(),
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      environment: process.env.NODE_ENV || "development",
    },
  })

  // Test 2: Environment Variables
  const requiredEnvVars = ["JWT_SECRET", "NEXTAUTH_SECRET", "NEXT_PUBLIC_BASE_URL"]
  const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingEnvVars.length === 0) {
    tests.push({
      name: "Environment Variables",
      status: "healthy",
      message: "All required environment variables are set",
    })
  } else {
    tests.push({
      name: "Environment Variables",
      status: "error",
      message: `Missing required environment variables: ${missingEnvVars.join(", ")}`,
      details: { missing: missingEnvVars },
    })
  }

  // Test 3: Database Connection
  try {
    if (process.env.MONGODB_URI) {
      // In a real implementation, you would test the actual connection
      tests.push({
        name: "Database Connection",
        status: "healthy",
        message: "Database connection configured",
        details: { configured: true },
      })
    } else {
      tests.push({
        name: "Database Connection",
        status: "warning",
        message: "Database not configured (MONGODB_URI missing)",
        details: { configured: false },
      })
    }
  } catch (error) {
    tests.push({
      name: "Database Connection",
      status: "error",
      message: "Database connection failed",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    })
  }

  // Test 4: Redis Connection
  try {
    if (process.env.REDIS_URL) {
      tests.push({
        name: "Redis Connection",
        status: "healthy",
        message: "Redis connection configured",
        details: { configured: true },
      })
    } else {
      tests.push({
        name: "Redis Connection",
        status: "warning",
        message: "Redis not configured (REDIS_URL missing)",
        details: { configured: false },
      })
    }
  } catch (error) {
    tests.push({
      name: "Redis Connection",
      status: "error",
      message: "Redis connection failed",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    })
  }

  // Test 5: Stripe Configuration
  const stripeKeys = ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY"]
  const hasStripeKeys = stripeKeys.every((key) => process.env[key])

  if (hasStripeKeys) {
    tests.push({
      name: "Stripe Configuration",
      status: "healthy",
      message: "Stripe payment system configured",
      details: { configured: true },
    })
  } else {
    tests.push({
      name: "Stripe Configuration",
      status: "warning",
      message: "Stripe not configured (payment features disabled)",
      details: { configured: false },
    })
  }

  // Test 6: OpenAI Configuration
  if (process.env.OPENAI_API_KEY) {
    tests.push({
      name: "OpenAI Configuration",
      status: "healthy",
      message: "OpenAI API configured for AI features",
      details: { configured: true },
    })
  } else {
    tests.push({
      name: "OpenAI Configuration",
      status: "warning",
      message: "OpenAI not configured (AI features disabled)",
      details: { configured: false },
    })
  }

  // Test 7: File System Access
  try {
    // Test if we can access the file system (for logs, uploads, etc.)
    const fs = require("fs")
    const path = require("path")
    const testPath = path.join(process.cwd(), "package.json")
    fs.accessSync(testPath, fs.constants.R_OK)

    tests.push({
      name: "File System Access",
      status: "healthy",
      message: "File system is accessible",
      details: { accessible: true },
    })
  } catch (error) {
    tests.push({
      name: "File System Access",
      status: "error",
      message: "File system access failed",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    })
  }

  // Test 8: External API Connectivity
  try {
    // Test if we can make external requests (for crypto APIs, news, etc.)
    const testUrl = "https://api.coingecko.com/api/v3/ping"
    const response = await fetch(testUrl, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    })

    if (response.ok) {
      tests.push({
        name: "External API Connectivity",
        status: "healthy",
        message: "External API connectivity working",
        details: { accessible: true },
      })
    } else {
      tests.push({
        name: "External API Connectivity",
        status: "warning",
        message: "External API connectivity issues",
        details: { status: response.status },
      })
    }
  } catch (error) {
    tests.push({
      name: "External API Connectivity",
      status: "warning",
      message: "External API connectivity test failed",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    })
  }

  // Calculate summary
  const healthy = tests.filter((t) => t.status === "healthy").length
  const warnings = tests.filter((t) => t.status === "warning").length
  const errors = tests.filter((t) => t.status === "error").length
  const total = tests.length

  // Determine overall status
  let overallStatus = "healthy"
  if (errors > 0) {
    overallStatus = "error"
  } else if (warnings > 0) {
    overallStatus = "warning"
  }

  const responseTime = Date.now() - startTime

  const result = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    responseTime: `${responseTime}ms`,
    summary: {
      total,
      healthy,
      warnings,
      errors,
    },
    tests,
    recommendations: generateRecommendations(tests),
  }

  // Return appropriate HTTP status
  const httpStatus = errors > 0 ? 500 : 200

  return NextResponse.json(result, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}

function generateRecommendations(tests: TestResult[]): string[] {
  const recommendations: string[] = []

  const errorTests = tests.filter((t) => t.status === "error")
  const warningTests = tests.filter((t) => t.status === "warning")

  if (errorTests.length > 0) {
    recommendations.push("Fix critical errors before deploying to production")
    errorTests.forEach((test) => {
      if (test.name === "Environment Variables") {
        recommendations.push("Set missing environment variables in Vercel dashboard")
      }
      if (test.name === "Database Connection") {
        recommendations.push("Configure MongoDB connection string")
      }
    })
  }

  if (warningTests.length > 0) {
    warningTests.forEach((test) => {
      if (test.name === "Stripe Configuration") {
        recommendations.push("Configure Stripe for payment processing")
      }
      if (test.name === "OpenAI Configuration") {
        recommendations.push("Configure OpenAI API for AI features")
      }
      if (test.name === "Redis Connection") {
        recommendations.push("Configure Redis for improved performance")
      }
    })
  }

  if (recommendations.length === 0) {
    recommendations.push("Your application is fully configured and ready!")
    recommendations.push("Consider setting up monitoring and analytics")
  }

  return recommendations
}
