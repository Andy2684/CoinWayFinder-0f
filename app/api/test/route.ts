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

  // Test 1: Environment Variables
  try {
    const requiredEnvVars = [
      "MONGODB_URI",
      "JWT_SECRET",
      "NEXTAUTH_SECRET",
      "STRIPE_PUBLISHABLE_KEY",
      "STRIPE_STARTER_PRICE_ID",
    ]

    const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

    if (missingVars.length === 0) {
      tests.push({
        name: "Environment Variables",
        status: "healthy",
        message: "All required environment variables are set",
      })
    } else {
      tests.push({
        name: "Environment Variables",
        status: "warning",
        message: `Missing variables: ${missingVars.join(", ")}`,
        details: { missing: missingVars },
      })
    }
  } catch (error) {
    tests.push({
      name: "Environment Variables",
      status: "error",
      message: "Failed to check environment variables",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }

  // Test 2: Database Connection
  try {
    if (process.env.MONGODB_URI) {
      // We can't actually test the connection without importing MongoDB
      // but we can check if the URI is properly formatted
      const uri = process.env.MONGODB_URI
      if (uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://")) {
        tests.push({
          name: "Database Configuration",
          status: "healthy",
          message: "MongoDB URI is properly configured",
        })
      } else {
        tests.push({
          name: "Database Configuration",
          status: "warning",
          message: "MongoDB URI format may be incorrect",
        })
      }
    } else {
      tests.push({
        name: "Database Configuration",
        status: "error",
        message: "MongoDB URI not configured",
      })
    }
  } catch (error) {
    tests.push({
      name: "Database Configuration",
      status: "error",
      message: "Database configuration check failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }

  // Test 3: Redis Configuration
  try {
    if (process.env.Redis_URL) {
      tests.push({
        name: "Redis Configuration",
        status: "healthy",
        message: "Redis URL is configured",
      })
    } else {
      tests.push({
        name: "Redis Configuration",
        status: "warning",
        message: "Redis URL not configured - some features may not work",
      })
    }
  } catch (error) {
    tests.push({
      name: "Redis Configuration",
      status: "error",
      message: "Redis configuration check failed",
    })
  }

  // Test 4: Stripe Configuration
  try {
    const stripeVars = [
      "STRIPE_PUBLISHABLE_KEY",
      "STRIPE_STARTER_PRICE_ID",
      "STRIPE_PRO_PRICE_ID",
      "STRIPE_ENTERPRISE_PRICE_ID",
    ]

    const configuredStripeVars = stripeVars.filter((envVar) => process.env[envVar])

    if (configuredStripeVars.length === stripeVars.length) {
      tests.push({
        name: "Stripe Configuration",
        status: "healthy",
        message: "All Stripe configuration variables are set",
      })
    } else if (configuredStripeVars.length > 0) {
      tests.push({
        name: "Stripe Configuration",
        status: "warning",
        message: `${configuredStripeVars.length}/${stripeVars.length} Stripe variables configured`,
      })
    } else {
      tests.push({
        name: "Stripe Configuration",
        status: "error",
        message: "No Stripe configuration found",
      })
    }
  } catch (error) {
    tests.push({
      name: "Stripe Configuration",
      status: "error",
      message: "Stripe configuration check failed",
    })
  }

  // Test 5: Memory Usage
  try {
    const memoryUsage = process.memoryUsage()
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)

    if (heapUsedMB < 100) {
      tests.push({
        name: "Memory Usage",
        status: "healthy",
        message: `Memory usage: ${heapUsedMB}MB (good)`,
        details: { heapUsedMB },
      })
    } else if (heapUsedMB < 500) {
      tests.push({
        name: "Memory Usage",
        status: "warning",
        message: `Memory usage: ${heapUsedMB}MB (moderate)`,
        details: { heapUsedMB },
      })
    } else {
      tests.push({
        name: "Memory Usage",
        status: "error",
        message: `Memory usage: ${heapUsedMB}MB (high)`,
        details: { heapUsedMB },
      })
    }
  } catch (error) {
    tests.push({
      name: "Memory Usage",
      status: "error",
      message: "Memory usage check failed",
    })
  }

  // Test 6: API Key Configuration
  try {
    if (process.env.API_SECRET_KEY) {
      tests.push({
        name: "API Key Configuration",
        status: "healthy",
        message: "API secret key is configured",
      })
    } else {
      tests.push({
        name: "API Key Configuration",
        status: "warning",
        message: "API secret key not configured",
      })
    }
  } catch (error) {
    tests.push({
      name: "API Key Configuration",
      status: "error",
      message: "API key configuration check failed",
    })
  }

  // Calculate summary
  const healthy = tests.filter((t) => t.status === "healthy").length
  const warnings = tests.filter((t) => t.status === "warning").length
  const errors = tests.filter((t) => t.status === "error").length
  const total = tests.length

  let overallStatus = "healthy"
  if (errors > 0) {
    overallStatus = "error"
  } else if (warnings > 0) {
    overallStatus = "warning"
  }

  const responseTime = Date.now() - startTime

  return NextResponse.json(
    {
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
    },
    {
      status: overallStatus === "error" ? 500 : 200,
    },
  )
}
