import { type NextRequest, NextResponse } from "next/server"
import { authManager } from "./auth"
import { adminManager } from "./admin"
import { apiKeyManager } from "./api-key-manager"
import { database } from "./database"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    apiKey: string
    permissions: string[]
    plan: string
    subscriptionStatus: "active" | "expired" | "cancelled"
  }
  admin?: {
    id: string
    userId: string
    email: string
    username: string
    isAdmin: boolean
    permissions: string[]
  }
}

export async function withAPIAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  requiredPermission?: string,
) {
  return async (req: NextRequest) => {
    const startTime = Date.now()

    try {
      // Extract API key from Authorization header
      const authHeader = req.headers.get("authorization")
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
      }

      const token = authHeader.substring(7) // Remove 'Bearer '
      const [keyId, secret] = token.split(":")

      if (!keyId || !secret) {
        return NextResponse.json({ error: "Invalid API key format. Use keyId:secret" }, { status: 401 })
      }

      // Validate API key
      const apiKey = await apiKeyManager.validateAPIKey(keyId, secret)
      if (!apiKey) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
      }

      // Check rate limits
      const rateLimitCheck = await apiKeyManager.checkRateLimit(keyId)
      if (!rateLimitCheck.allowed) {
        const response = NextResponse.json(
          {
            error: "Rate limit exceeded",
            resetTime: rateLimitCheck.resetTime?.toISOString(),
          },
          { status: 429 },
        )

        response.headers.set("X-RateLimit-Remaining", "0")
        if (rateLimitCheck.resetTime) {
          response.headers.set("X-RateLimit-Reset", Math.floor(rateLimitCheck.resetTime.getTime() / 1000).toString())
        }

        return response
      }

      // Get user subscription status
      const userSettings = await database.getUserSettings(apiKey.userId)
      const subscriptionStatus = userSettings?.subscription.status || "expired"

      // Check if user has required permission
      if (requiredPermission && !apiKey.permissions.includes(requiredPermission)) {
        return NextResponse.json(
          { error: `Insufficient permissions. Required: ${requiredPermission}` },
          { status: 403 },
        )
      }

      // For write operations, check if subscription is active
      const writeOperations = ["bots:create", "bots:manage", "bots:update", "bots:delete"]
      const isWriteOperation = requiredPermission && writeOperations.some((op) => requiredPermission.includes(op))

      if (isWriteOperation && subscriptionStatus !== "active") {
        return NextResponse.json(
          {
            error:
              "Subscription expired. Your existing bots will continue running, but you cannot create or modify bots until you renew your subscription.",
            subscriptionStatus,
            renewUrl: "/subscription",
          },
          { status: 402 }, // Payment Required
        )
      }

      // Add user info to request
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        userId: apiKey.userId,
        apiKey: keyId,
        permissions: apiKey.permissions,
        plan: userSettings?.subscription.plan || "free",
        subscriptionStatus,
      }

      // Execute the handler
      const response = await handler(authenticatedReq)

      // Record usage
      const responseTime = Date.now() - startTime
      const userAgent = req.headers.get("user-agent") || undefined
      const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined

      await apiKeyManager.recordUsage(
        keyId,
        req.nextUrl.pathname,
        req.method,
        response.status,
        responseTime,
        userAgent,
        ipAddress,
      )

      // Add rate limit headers
      response.headers.set("X-RateLimit-Remaining", (rateLimitCheck.remaining || 0).toString())
      response.headers.set("X-RateLimit-Limit", apiKey.rateLimit.requestsPerMinute.toString())

      return response
    } catch (error) {
      console.error("API middleware error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}

export function withGracefulExpiration(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withAPIAuth(async (req: AuthenticatedRequest) => {
    const { subscriptionStatus } = req.user!

    // Add subscription status to response headers for client awareness
    const response = await handler(req)
    response.headers.set("X-Subscription-Status", subscriptionStatus)

    // Add warning header if subscription is expired
    if (subscriptionStatus === "expired") {
      response.headers.set(
        "X-Subscription-Warning",
        "Your subscription has expired. Existing bots will continue running, but new actions require renewal.",
      )
    }

    return response
  })
}

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<Response>,
  options: { requireAuth?: boolean; requireAdmin?: boolean } = {},
) {
  return async (req: NextRequest) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest

      // Check for admin authentication first
      const admin = await adminManager.getCurrentAdmin()
      if (admin) {
        authenticatedReq.admin = admin
        authenticatedReq.user = {
          userId: admin.userId,
          apiKey: "",
          permissions: admin.permissions,
          plan: "",
          subscriptionStatus: "active",
        }
      } else {
        // Check for regular user authentication
        const authHeader = req.headers.get("authorization")
        if (authHeader && authHeader.startsWith("Bearer ")) {
          const token = authHeader.substring(7)
          // Validate token and set user
          // This would integrate with your auth system
          const user = await authManager.getCurrentUser(token)
          if (user) {
            authenticatedReq.user = user
          }
        }
      }

      // Check authentication requirements
      if (options.requireAuth && !authenticatedReq.user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      if (options.requireAdmin && !authenticatedReq.admin) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 })
      }

      return await handler(authenticatedReq)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}

export async function withSubscriptionCheck(
  handler: (req: AuthenticatedRequest) => Promise<Response>,
  feature?: string,
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (!req.user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      // Check subscription access
      if (feature && req.user.subscriptionStatus !== "active") {
        return NextResponse.json(
          {
            error: "Subscription upgrade required",
            message: `This feature requires an active subscription`,
            feature,
          },
          { status: 402 },
        )
      }

      return await handler(req)
    } catch (error) {
      console.error("Subscription check error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function withRateLimit(
  handler: (req: AuthenticatedRequest) => Promise<Response>,
  options: { maxRequests?: number; windowMs?: number } = {},
) {
  const { maxRequests = 100, windowMs = 60000 } = options

  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (!req.user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      // Simple rate limiting logic would go here
      // In production, use Redis or similar

      return await handler(req)
    } catch (error) {
      console.error("Rate limit error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  })
}

export function createApiResponse(data: any, status = 200) {
  return NextResponse.json(data, { status })
}

export function createErrorResponse(message: string, status = 400, details?: any) {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status },
  )
}

export async function validateRequestBody<T>(req: NextRequest, schema?: any): Promise<T> {
  try {
    const body = await req.json()

    if (schema) {
      // If using Zod or similar validation library
      return schema.parse(body)
    }

    return body as T
  } catch (error) {
    throw new Error("Invalid request body")
  }
}

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

export async function handleCors(req: NextRequest) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders(),
    })
  }
  return null
}
