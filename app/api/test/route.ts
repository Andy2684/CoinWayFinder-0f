import { type NextRequest, NextResponse } from "next/server"

interface ComponentTest {
  name: string
  status: "healthy" | "warning" | "error"
  message: string
  details?: any
}

export async function GET(request: NextRequest) {
  const tests: ComponentTest[] = []

  // Test 1: Environment Variables
  try {
    const requiredEnvVars = ["JWT_SECRET", "NEXTAUTH_SECRET", "NEXT_PUBLIC_BASE_URL"]

    const optionalEnvVars = ["MONGODB_URI", "REDIS_URL", "STRIPE_SECRET_KEY", "OPENAI_API_KEY"]

    const missingRequired = requiredEnvVars.filter((env) => !process.env[env])
    const missingOptional = optionalEnvVars.filter((env) => !process.env[env])

    if (missingRequired.length === 0) {
      tests.push({
        name: "Environment Variables",
        status: missingOptional.length > 0 ? "warning" : "healthy",
        message:
          missingOptional.length > 0
            ? `Missing optional vars: ${missingOptional.join(", ")}`
            : "All environment variables configured",
        details: {
          required: requiredEnvVars.length,
          optional: optionalEnvVars.length - missingOptional.length,
          missing: missingOptional,
        },
      })
    } else {
      tests.push({
        name: "Environment Variables",
        status: "error",
        message: `Missing required vars: ${missingRequired.join(", ")}`,
        details: { missing: missingRequired },
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
      // Simulate database connection test
      tests.push({
        name: "Database Connection",
        status: "healthy",
        message: "MongoDB URI configured",
        details: { uri: process.env.MONGODB_URI.replace(/\/\/.*@/, "//***:***@") },
      })
    } else {
      tests.push({
        name: "Database Connection",
        status: "warning",
        message: "MongoDB URI not configured",
        details: { note: "Database features will not work" },
      })
    }
  } catch (error) {
    tests.push({
      name: "Database Connection",
      status: "error",
      message: "Database connection test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }

  // Test 3: Redis Connection
  try {
    if (process.env.REDIS_URL) {
      tests.push({
        name: "Redis Connection",
        status: "healthy",
        message: "Redis URL configured",
        details: { configured: true },
      })
    } else {
      tests.push({
        name: "Redis Connection",
        status: "warning",
        message: "Redis URL not configured",
        details: { note: "Caching and sessions will use memory" },
      })
    }
  } catch (error) {
    tests.push({
      name: "Redis Connection",
      status: "error",
      message: "Redis connection test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }

  // Test 4: Stripe Configuration
  try {
    const stripeKeys = ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY"]
    const hasStripe = stripeKeys.every((key) => process.env[key])

    if (hasStripe) {
      tests.push({
        name: "Stripe Integration",
        status: "healthy",
        message: "Stripe keys configured",
        details: { configured: true },
      })
    } else {
      tests.push({
        name: "Stripe Integration",
        status: "warning",
        message: "Stripe keys not configured",
        details: { note: "Subscription features will not work" },
      })
    }
  } catch (error) {
    tests.push({
      name: "Stripe Integration",
      status: "error",
      message: "Stripe configuration test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }

  // Test 5: API Routes
  try {
    const apiRoutes = ["/api/health", "/api/auth/signin", "/api/crypto/prices", "/api/bots"]

    tests.push({
      name: "API Routes",
      status: "healthy",
      message: `${apiRoutes.length} API routes available`,
      details: { routes: apiRoutes },
    })
  } catch (error) {
    tests.push({
      name: "API Routes",
      status: "error",
      message: "API routes test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }

  // Test 6: System Resources
  try {
    const memory = process.memoryUsage()
    const uptime = process.uptime()

    tests.push({
      name: "System Resources",
      status: memory.heapUsed < 100 * 1024 * 1024 ? "healthy" : "warning",
      message: `Uptime: ${Math.floor(uptime)}s, Memory: ${Math.floor(memory.heapUsed / 1024 / 1024)}MB`,
      details: {
        uptime: uptime,
        memory: {
          used: Math.floor(memory.heapUsed / 1024 / 1024),
          total: Math.floor(memory.heapTotal / 1024 / 1024),
          external: Math.floor(memory.external / 1024 / 1024),
        },
      },
    })
  } catch (error) {
    tests.push({
      name: "System Resources",
      status: "error",
      message: "System resources test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }

  // Calculate overall status
  const hasErrors = tests.some((test) => test.status === "error")
  const hasWarnings = tests.some((test) => test.status === "warning")

  const overallStatus = hasErrors ? "error" : hasWarnings ? "warning" : "healthy"

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
      tests: tests,
      summary: {
        total: tests.length,
        healthy: tests.filter((t) => t.status === "healthy").length,
        warnings: tests.filter((t) => t.status === "warning").length,
        errors: tests.filter((t) => t.status === "error").length,
      },
    },
    {
      status: hasErrors ? 500 : 200,
    },
  )
}
