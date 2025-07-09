import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "./auth"
import { AdminService } from "./admin"
import { database } from "./database"

export interface APIAuthContext {
  user?: {
    id: string
    email: string
    name: string
    subscription?: {
      plan: string
      status: string
      endDate?: Date
    }
  }
  admin?: {
    userId: string
    username: string
    email: string
    isAdmin: boolean
  }
  isAuthenticated: boolean
  isAdmin: boolean
}

export function withAPIAuth(handler: (req: NextRequest, context: APIAuthContext) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const context: APIAuthContext = {
        isAuthenticated: false,
        isAdmin: false,
      }

      // Check for admin authentication first
      const adminToken = req.cookies.get("admin-token")?.value
      if (adminToken) {
        const admin = AdminService.verifyAdminToken(adminToken)
        if (admin) {
          context.admin = admin
          context.isAdmin = true
          context.isAuthenticated = true
        }
      }

      // If not admin, check for user authentication
      if (!context.isAuthenticated) {
        const userToken = req.cookies.get("auth-token")?.value
        if (userToken) {
          const user = AuthService.verifyToken(userToken)
          if (user) {
            // Get user settings for subscription info
            const userSettings = await database.getUserSettings(user.id)
            context.user = {
              ...user,
              subscription: userSettings?.subscription,
            }
            context.isAuthenticated = true
          }
        }
      }

      return await handler(req, context)
    } catch (error) {
      console.error("API Auth middleware error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}

export function withGracefulExpiration(handler: (req: NextRequest, context: APIAuthContext) => Promise<NextResponse>) {
  return withAPIAuth(async (req: NextRequest, context: APIAuthContext) => {
    try {
      // If user is authenticated, check if their subscription is expired
      if (context.user?.subscription) {
        const { subscription } = context.user

        // Check if subscription is expired
        if (subscription.status === "active" && subscription.plan !== "free") {
          const settings = await database.getUserSettings(context.user.id)
          if (settings?.subscription?.endDate && new Date() > settings.subscription.endDate) {
            // Gracefully downgrade to free plan
            await database.updateUserSettings(context.user.id, {
              subscription: {
                plan: "free",
                status: "active",
                startDate: new Date(),
              },
            })

            // Update context
            context.user.subscription = {
              plan: "free",
              status: "active",
            }
          }
        }
      }

      return await handler(req, context)
    } catch (error) {
      console.error("Graceful expiration middleware error:", error)
      return await handler(req, context)
    }
  })
}

export function requireAuth(handler: (req: NextRequest, context: APIAuthContext) => Promise<NextResponse>) {
  return withAPIAuth(async (req: NextRequest, context: APIAuthContext) => {
    if (!context.isAuthenticated) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    return await handler(req, context)
  })
}

export function requireAdmin(handler: (req: NextRequest, context: APIAuthContext) => Promise<NextResponse>) {
  return withAPIAuth(async (req: NextRequest, context: APIAuthContext) => {
    if (!context.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
    return await handler(req, context)
  })
}

export function requireSubscription(plans: string[]) {
  return (handler: (req: NextRequest, context: APIAuthContext) => Promise<NextResponse>) =>
    requireAuth(async (req: NextRequest, context: APIAuthContext) => {
      // Admin always has access
      if (context.isAdmin) {
        return await handler(req, context)
      }

      // Check user subscription
      if (!context.user?.subscription) {
        return NextResponse.json({ error: "Subscription required" }, { status: 403 })
      }

      const userPlan = context.user.subscription.plan
      if (!plans.includes(userPlan) && userPlan !== "admin") {
        return NextResponse.json(
          {
            error: "Subscription upgrade required",
            requiredPlans: plans,
            currentPlan: userPlan,
          },
          { status: 403 },
        )
      }

      return await handler(req, context)
    })
}

export function withRateLimit(maxRequests: number, windowMs: number) {
  const requests = new Map<string, { count: number; resetTime: number }>()

  return (handler: (req: NextRequest, context: APIAuthContext) => Promise<NextResponse>) =>
    withAPIAuth(async (req: NextRequest, context: APIAuthContext) => {
      const identifier = context.user?.id || context.admin?.userId || req.ip || "anonymous"
      const now = Date.now()

      const userRequests = requests.get(identifier)

      if (!userRequests || now > userRequests.resetTime) {
        requests.set(identifier, { count: 1, resetTime: now + windowMs })
      } else {
        userRequests.count++

        if (userRequests.count > maxRequests) {
          return NextResponse.json(
            {
              error: "Rate limit exceeded",
              retryAfter: Math.ceil((userRequests.resetTime - now) / 1000),
            },
            { status: 429 },
          )
        }
      }

      return await handler(req, context)
    })
}

export function withCORS(handler: (req: NextRequest, context: APIAuthContext) => Promise<NextResponse>) {
  return withAPIAuth(async (req: NextRequest, context: APIAuthContext) => {
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      })
    }

    const response = await handler(req, context)

    // Add CORS headers to response
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    return response
  })
}
