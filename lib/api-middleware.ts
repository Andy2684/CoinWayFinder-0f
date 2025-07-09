import { type NextRequest, NextResponse } from "next/server"
import { apiKeyManager } from "./api-key-manager"

export interface AuthenticatedRequest extends NextRequest {
  apiKey?: any
  userId?: string
}

export async function withApiAuth(
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

      const token = authHeader.substring(7) // Remove "Bearer "
      const [keyId, keySecret] = token.split(":")

      if (!keyId || !keySecret) {
        return NextResponse.json({ error: "Invalid API key format" }, { status: 401 })
      }

      // Validate API key
      const apiKey = await apiKeyManager.validateApiKey(keyId, keySecret)
      if (!apiKey) {
        return NextResponse.json({ error: "Invalid or expired API key" }, { status: 401 })
      }

      // Check rate limits
      const rateLimitCheck = await apiKeyManager.checkRateLimit(keyId)
      if (!rateLimitCheck.allowed) {
        const response = NextResponse.json(
          {
            error: "Rate limit exceeded",
            resetTime: rateLimitCheck.resetTime,
          },
          { status: 429 },
        )

        response.headers.set("X-RateLimit-Remaining", "0")
        response.headers.set("X-RateLimit-Reset", rateLimitCheck.resetTime?.toISOString() || "")
        return response
      }

      // Check permissions
      if (requiredPermission && !apiKeyManager.hasPermission(apiKey, requiredPermission)) {
        return NextResponse.json(
          { error: `Insufficient permissions. Required: ${requiredPermission}` },
          { status: 403 },
        )
      }

      // Add API key info to request
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.apiKey = apiKey
      authenticatedReq.userId = apiKey.userId

      // Call the handler
      const response = await handler(authenticatedReq)

      // Record usage
      const responseTime = Date.now() - startTime
      const endpoint = new URL(req.url).pathname
      const method = req.method

      await apiKeyManager.incrementUsage(keyId, endpoint, method, responseTime, response.status)

      // Add rate limit headers
      response.headers.set("X-RateLimit-Remaining", rateLimitCheck.remaining?.toString() || "0")
      response.headers.set("X-RateLimit-Limit", apiKey.rateLimit.requestsPerMinute.toString())

      return response
    } catch (error) {
      console.error("API middleware error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}
