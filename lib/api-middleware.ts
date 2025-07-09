import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "./auth"
import { AdminService } from "./admin"
import { subscriptionManager } from "./subscription-manager"

interface APIResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    username: string
    subscription: {
      plan: "free" | "starter" | "pro" | "enterprise"
      status: "active" | "inactive" | "trial" | "cancelled"
      expiresAt?: Date
      trialEndsAt?: Date
    }
  }
  admin?: {
    id: string
    username: string
    role: "admin"
  }
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

export interface APIContext {
  user: {
    userId: string
    email: string
    username: string
  }
  isAdmin?: boolean
}

class APIMiddleware {
  private rateLimitStore: RateLimitStore = {}

  // Rate limiting
  private checkRateLimit(identifier: string, limit = 100, windowMs = 60000): boolean {
    const now = Date.now()
    const key = identifier

    if (!this.rateLimitStore[key]) {
      this.rateLimitStore[key] = { count: 1, resetTime: now + windowMs }
      return true
    }

    const store = this.rateLimitStore[key]

    if (now > store.resetTime) {
      store.count = 1
      store.resetTime = now + windowMs
      return true
    }

    if (store.count >= limit) {
      return false
    }

    store.count++
    return true
  }

  // CORS headers
  private setCORSHeaders(response: NextResponse): NextResponse {
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response
  }

  // Success response
  createSuccessResponse<T>(data: T, message?: string): NextResponse<APIResponse<T>> {
    const response = NextResponse.json({
      success: true,
      data,
      message,
    })
    return this.setCORSHeaders(response)
  }

  // Error response
  createErrorResponse(message: string, status = 400): NextResponse<APIResponse> {
    const response = NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status },
    )
    return this.setCORSHeaders(response)
  }

  // Authentication middleware
  async withAuth(
    request: NextRequest,
    handler: (request: NextRequest, user: any) => Promise<NextResponse>,
  ): Promise<NextResponse> {
    try {
      // Handle OPTIONS request
      if (request.method === "OPTIONS") {
        return this.setCORSHeaders(new NextResponse(null, { status: 200 }))
      }

      // Check rate limit
      const clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown"
      if (!this.checkRateLimit(clientIP)) {
        return this.createErrorResponse("Rate limit exceeded", 429)
      }

      // Get auth token from header or cookie
      let token = request.headers.get("authorization")?.replace("Bearer ", "")

      if (!token) {
        // Try to get from cookie
        const cookieHeader = request.headers.get("cookie")
        if (cookieHeader) {
          const cookies = cookieHeader.split(";").reduce(
            (acc, cookie) => {
              const [key, value] = cookie.trim().split("=")
              acc[key] = value
              return acc
            },
            {} as Record<string, string>,
          )
          token = cookies["auth-token"]
        }
      }

      if (!token) {
        return this.createErrorResponse("Authentication required", 401)
      }

      // Verify token
      const user = AuthService.verifyToken(token)
      if (!user) {
        return this.createErrorResponse("Invalid or expired token", 401)
      }

      return handler(request, user)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return this.createErrorResponse("Internal server error", 500)
    }
  }

  // Admin authentication middleware
  async withAdminAuth(
    request: NextRequest,
    handler: (request: NextRequest, admin: any) => Promise<NextResponse>,
  ): Promise<NextResponse> {
    try {
      // Handle OPTIONS request
      if (request.method === "OPTIONS") {
        return this.setCORSHeaders(new NextResponse(null, { status: 200 }))
      }

      // Check rate limit
      const clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown"
      if (!this.checkRateLimit(clientIP)) {
        return this.createErrorResponse("Rate limit exceeded", 429)
      }

      // Get admin token from header or cookie
      let token = request.headers.get("authorization")?.replace("Bearer ", "")

      if (!token) {
        // Try to get from cookie
        const cookieHeader = request.headers.get("cookie")
        if (cookieHeader) {
          const cookies = cookieHeader.split(";").reduce(
            (acc, cookie) => {
              const [key, value] = cookie.trim().split("=")
              acc[key] = value
              return acc
            },
            {} as Record<string, string>,
          )
          token = cookies["admin-token"]
        }
      }

      if (!token) {
        return this.createErrorResponse("Admin authentication required", 401)
      }

      // Verify admin token
      const admin = AdminService.verifyAdminToken(token)
      if (!admin) {
        return this.createErrorResponse("Invalid or expired admin token", 401)
      }

      return handler(request, admin)
    } catch (error) {
      console.error("Admin auth middleware error:", error)
      return this.createErrorResponse("Internal server error", 500)
    }
  }

  // API key authentication middleware
  async withAPIKeyAuth(
    request: NextRequest,
    handler: (request: NextRequest, apiKey: any) => Promise<NextResponse>,
  ): Promise<NextResponse> {
    try {
      // Handle OPTIONS request
      if (request.method === "OPTIONS") {
        return this.setCORSHeaders(new NextResponse(null, { status: 200 }))
      }

      // Check rate limit
      const clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown"
      if (!this.checkRateLimit(clientIP, 1000)) {
        // Higher limit for API keys
        return this.createErrorResponse("Rate limit exceeded", 429)
      }

      // Get API key from header
      const apiKey = request.headers.get("x-api-key")
      if (!apiKey) {
        return this.createErrorResponse("API key required", 401)
      }

      // Validate API key (simplified - in real app, check against database)
      if (!apiKey.startsWith("cwf_")) {
        return this.createErrorResponse("Invalid API key format", 401)
      }

      const apiKeyData = {
        key: apiKey,
        userId: "extracted-from-key", // In real app, extract from database
        permissions: ["read", "write"],
      }

      return handler(request, apiKeyData)
    } catch (error) {
      console.error("API key auth middleware error:", error)
      return this.createErrorResponse("Internal server error", 500)
    }
  }

  // Graceful expiration middleware
  async withGracefulExpiration(
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>,
  ): Promise<NextResponse> {
    try {
      const response = await handler(request)

      // Add cache headers for graceful expiration
      response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60")
      response.headers.set("X-Powered-By", "CoinWayFinder")

      return this.setCORSHeaders(response)
    } catch (error) {
      console.error("Graceful expiration middleware error:", error)
      return this.createErrorResponse("Internal server error", 500)
    }
  }

  // Request validation middleware
  async withValidation(
    request: NextRequest,
    schema: any,
    handler: (request: NextRequest, data: any) => Promise<NextResponse>,
  ): Promise<NextResponse> {
    try {
      const body = await request.json()

      // Simple validation (in real app, use Zod or similar)
      if (!body || typeof body !== "object") {
        return this.createErrorResponse("Invalid request body", 400)
      }

      return handler(request, body)
    } catch (error) {
      if (error instanceof SyntaxError) {
        return this.createErrorResponse("Invalid JSON", 400)
      }
      console.error("Validation middleware error:", error)
      return this.createErrorResponse("Internal server error", 500)
    }
  }

  // Cleanup expired rate limit entries
  private cleanupRateLimit(): void {
    const now = Date.now()
    Object.keys(this.rateLimitStore).forEach((key) => {
      if (now > this.rateLimitStore[key].resetTime) {
        delete this.rateLimitStore[key]
      }
    })
  }
}

const apiMiddleware = new APIMiddleware()

// Export middleware functions
export async function withAPIAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
): Promise<NextResponse> {
  return apiMiddleware.withAuth(request, handler)
}

export async function withAdminAuth(
  request: NextRequest,
  handler: (request: NextRequest, admin: any) => Promise<NextResponse>,
): Promise<NextResponse> {
  return apiMiddleware.withAdminAuth(request, handler)
}

export async function withAPIKeyAuth(
  request: NextRequest,
  handler: (request: NextRequest, apiKey: any) => Promise<NextResponse>,
): Promise<NextResponse> {
  return apiMiddleware.withAPIKeyAuth(request, handler)
}

export async function withGracefulExpiration(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  return apiMiddleware.withGracefulExpiration(request, handler)
}

export async function withValidation(
  request: NextRequest,
  schema: any,
  handler: (request: NextRequest, data: any) => Promise<NextResponse>,
): Promise<NextResponse> {
  return apiMiddleware.withValidation(request, schema, handler)
}

// Export response helpers
export const createSuccessResponse = apiMiddleware.createSuccessResponse.bind(apiMiddleware)
export const createErrorResponse = apiMiddleware.createErrorResponse.bind(apiMiddleware)

// Cleanup rate limit entries every 5 minutes
setInterval(
  () => {
    apiMiddleware["cleanupRateLimit"]()
  },
  5 * 60 * 1000,
)

export function withSubscriptionCheck(
  handler: (req: NextRequest, context: APIContext) => Promise<NextResponse>,
  requiredFeature?: string,
) {
  return withAPIAuth(async (req: NextRequest, context: APIContext): Promise<NextResponse> => {
    try {
      // Admin bypass
      if (context.isAdmin) {
        return handler(req, context)
      }

      // Check subscription access
      if (requiredFeature) {
        const hasAccess = await subscriptionManager.checkAccess(context.user.userId, requiredFeature)
        if (!hasAccess) {
          return NextResponse.json(
            {
              error: "Subscription required",
              message: `This feature requires a subscription. Please upgrade your plan.`,
              feature: requiredFeature,
            },
            { status: 403 },
          )
        }
      }

      return handler(req, context)
    } catch (error) {
      console.error("Subscription check middleware error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  })
}

export function withRateLimit(
  handler: (req: NextRequest, context: APIContext) => Promise<NextResponse>,
  limit = 100,
  windowMs: number = 60 * 1000, // 1 minute
) {
  const requests = new Map<string, { count: number; resetTime: number }>()

  return withAPIAuth(async (req: NextRequest, context: APIContext): Promise<NextResponse> => {
    try {
      const key = context.user.userId
      const now = Date.now()

      // Clean up expired entries
      for (const [userId, data] of requests.entries()) {
        if (now > data.resetTime) {
          requests.delete(userId)
        }
      }

      // Get or create rate limit data
      let rateLimitData = requests.get(key)
      if (!rateLimitData || now > rateLimitData.resetTime) {
        rateLimitData = { count: 0, resetTime: now + windowMs }
        requests.set(key, rateLimitData)
      }

      // Check rate limit
      if (rateLimitData.count >= limit) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message: `Too many requests. Limit: ${limit} per ${windowMs / 1000} seconds`,
            retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000),
          },
          { status: 429 },
        )
      }

      // Increment counter
      rateLimitData.count++

      const response = await handler(req, context)

      // Add rate limit headers
      response.headers.set("X-RateLimit-Limit", limit.toString())
      response.headers.set("X-RateLimit-Remaining", (limit - rateLimitData.count).toString())
      response.headers.set("X-RateLimit-Reset", rateLimitData.resetTime.toString())

      return response
    } catch (error) {
      console.error("Rate limit middleware error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  })
}

export function corsMiddleware(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
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

    const response = await handler(req)

    // Add CORS headers to all responses
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    return response
  }
}
