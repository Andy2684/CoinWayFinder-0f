import { type NextRequest, NextResponse } from "next/server"
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
