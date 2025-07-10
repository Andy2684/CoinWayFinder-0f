import { type NextRequest, NextResponse } from "next/server"
import { authService } from "./auth"
import { apiKeyManager } from "./api-key-manager"
import { subscriptionManager } from "./subscription-manager"
import { adminManager } from "./admin"
import crypto from "crypto"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    username: string
    role?: string
    subscriptionStatus: string
    subscription?: any
  }
  apiKey?: {
    id: string
    userId: string
    permissions: string[]
  }
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    timestamp: string
    requestId: string
    rateLimit?: {
      remaining: number
      resetTime: string
    }
  }
}

export function createResponse(data: any, status = 200) {
  return NextResponse.json(data, { status })
}

export function createErrorResponse(message: string, status = 400) {
  return NextResponse.json({ error: { message } }, { status })
}

export function withAPIAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  requiredPermission?: string,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const authenticatedReq = req as AuthenticatedRequest

      // Check for API key first
      const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "")

      if (apiKey) {
        const keyData = await apiKeyManager.validateAPIKey(apiKey)
        if (!keyData) {
          return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
        }

        // Check rate limits
        const rateLimitCheck = await apiKeyManager.checkRateLimit(keyData)
        if (!rateLimitCheck.allowed) {
          return NextResponse.json(
            {
              error: "Rate limit exceeded",
              resetTime: rateLimitCheck.resetTime,
            },
            { status: 429 },
          )
        }

        // Check permissions
        if (
          requiredPermission &&
          !keyData.permissions.includes(requiredPermission) &&
          !keyData.permissions.includes("*")
        ) {
          return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
        }

        // Get user data
        const user = await authService.getUserById(keyData.userId)
        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        authenticatedReq.user = {
          userId: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          subscriptionStatus: user.subscription?.status || "inactive",
          subscription: user.subscription,
        }

        authenticatedReq.apiKey = {
          id: keyData.id,
          userId: keyData.userId,
          permissions: keyData.permissions,
        }

        // Record API usage
        const startTime = Date.now()
        const response = await handler(authenticatedReq)
        const responseTime = Date.now() - startTime

        // Record usage asynchronously
        setImmediate(() => {
          apiKeyManager.recordAPIUsage(
            keyData.id,
            req.nextUrl.pathname,
            req.method,
            responseTime,
            response.status,
            req.headers.get("user-agent") || undefined,
            req.ip || req.headers.get("x-forwarded-for") || undefined,
          )
        })

        return response
      }

      // Check for auth token
      const authToken = req.cookies.get("auth-token")?.value
      if (!authToken) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      const user = await authService.verifyAuthToken(authToken)
      if (!user) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
      }

      authenticatedReq.user = {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        subscriptionStatus: user.subscription?.status || "inactive",
        subscription: user.subscription,
      }

      return handler(authenticatedReq)
    } catch (error) {
      console.error("API auth middleware error:", error)
      return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
    }
  }
}

export function withAdminAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const adminToken = req.cookies.get("admin-token")?.value
      if (!adminToken) {
        return NextResponse.json({ error: "Admin authentication required" }, { status: 401 })
      }

      const { verifyAdminToken } = await import("./admin")
      const admin = await verifyAdminToken(adminToken)
      if (!admin) {
        return NextResponse.json({ error: "Invalid admin token" }, { status: 401 })
      }

      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        userId: admin.id,
        email: admin.email || "",
        username: admin.username,
        role: admin.role,
        subscriptionStatus: "active", // Admins always have access
      }

      return handler(authenticatedReq)
    } catch (error) {
      console.error("Admin auth middleware error:", error)
      return NextResponse.json({ error: "Admin authentication failed" }, { status: 500 })
    }
  }
}

export function withSubscriptionCheck(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  requiredFeature?: string,
) {
  return withAPIAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
    try {
      const user = req.user
      if (!user) {
        return createErrorResponse("Authentication required", 401)
      }

      // Admin bypass
      const admin = await adminManager.getCurrentAdmin()
      if (admin) {
        return handler(req)
      }

      // Check subscription access
      if (requiredFeature) {
        const hasAccess = await subscriptionManager.checkAccess(user.userId, requiredFeature)
        if (!hasAccess) {
          return NextResponse.json(
            {
              error: `Feature not available: ${requiredFeature}`,
              subscriptionStatus: user.subscriptionStatus,
              upgradeUrl: "/subscription",
            },
            { status: 403 },
          )
        }
      }

      return handler(req)
    } catch (error) {
      console.error("Subscription check middleware error:", error)
      return NextResponse.json({ error: "Internal server error", status: 500 })
    }
  })
}

export function withGracefulExpiration(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: AuthenticatedRequest): Promise<NextResponse> => {
    try {
      // First authenticate the request
      const authResult = await withAPIAuth(handler)(req)

      // If authentication failed, return the error
      if (authResult.status !== 200) {
        return authResult
      }

      // Check subscription status
      if (req.user && req.user.subscriptionStatus !== "active") {
        // Allow read operations but restrict write operations
        if (req.method !== "GET") {
          return NextResponse.json(
            {
              error: "Subscription expired. Read-only access granted.",
              subscriptionStatus: req.user.subscriptionStatus,
              upgradeUrl: "/subscription",
            },
            { status: 402 },
          )
        }
      }

      return handler(req)
    } catch (error) {
      console.error("Graceful expiration middleware error:", error)
      return NextResponse.json({ error: "Request processing failed" }, { status: 500 })
    }
  }
}

export function withFeatureAccess(feature: string) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) =>
    async (req: AuthenticatedRequest): Promise<NextResponse> => {
      try {
        if (!req.user) {
          return NextResponse.json({ error: "Authentication required" }, { status: 401 })
        }

        const hasAccess = await subscriptionManager.checkAccess(req.user.userId, feature)
        if (!hasAccess) {
          return NextResponse.json(
            {
              error: `Feature not available: ${feature}`,
              subscriptionStatus: req.user.subscriptionStatus,
              upgradeUrl: "/subscription",
            },
            { status: 403 },
          )
        }

        return handler(req)
      } catch (error) {
        console.error("Feature access middleware error:", error)
        return NextResponse.json({ error: "Feature access check failed" }, { status: 500 })
      }
    }
}

export function withValidation<T>(schema: any) {
  return (handler: (req: AuthenticatedRequest, body: T) => Promise<NextResponse>) =>
    async (req: AuthenticatedRequest): Promise<NextResponse> => {
      try {
        const body = await req.json()
        const validatedBody = schema.parse(body)
        return handler(req, validatedBody)
      } catch (error: any) {
        if (error.name === "ZodError") {
          return NextResponse.json(
            {
              error: "Invalid request body",
              details: error.errors,
            },
            { status: 400 },
          )
        }

        console.error("Validation middleware error:", error)
        return NextResponse.json({ error: "Request validation failed" }, { status: 500 })
      }
    }
}

export function withRateLimit(requests = 100, windowMs = 60000) {
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) =>
    async (req: AuthenticatedRequest): Promise<NextResponse> => {
      try {
        const identifier = req.user?.userId || req.ip || "anonymous"
        const now = Date.now()
        const windowStart = now - windowMs

        // Clean up old entries
        for (const [key, value] of rateLimitMap.entries()) {
          if (value.resetTime < windowStart) {
            rateLimitMap.delete(key)
          }
        }

        const current = rateLimitMap.get(identifier) || { count: 0, resetTime: now + windowMs }

        if (current.count >= requests && current.resetTime > now) {
          return NextResponse.json(
            {
              error: "Rate limit exceeded",
              resetTime: new Date(current.resetTime).toISOString(),
            },
            { status: 429 },
          )
        }

        current.count++
        rateLimitMap.set(identifier, current)

        const response = await handler(req)

        // Add rate limit headers
        response.headers.set("X-RateLimit-Limit", requests.toString())
        response.headers.set("X-RateLimit-Remaining", Math.max(0, requests - current.count).toString())
        response.headers.set("X-RateLimit-Reset", new Date(current.resetTime).toISOString())

        return response
      } catch (error) {
        console.error("Rate limit middleware error:", error)
        return NextResponse.json({ error: "Rate limit check failed" }, { status: 500 })
      }
    }
}

export function withCORS(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: AuthenticatedRequest): Promise<NextResponse> => {
    try {
      // Handle preflight requests
      if (req.method === "OPTIONS") {
        return new NextResponse(null, {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
            "Access-Control-Max-Age": "86400",
          },
        })
      }

      const response = await handler(req)

      // Add CORS headers to response
      response.headers.set("Access-Control-Allow-Origin", "*")
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key")

      return response
    } catch (error) {
      console.error("CORS middleware error:", error)
      return NextResponse.json({ error: "CORS handling failed" }, { status: 500 })
    }
  }
}

export function createAPIResponse<T>(data?: T, error?: string, status = 200, meta?: any): NextResponse {
  const response: APIResponse<T> = {
    success: !error,
    ...(data && { data }),
    ...(error && { error }),
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      ...meta,
    },
  }

  return NextResponse.json(response, { status })
}

export function withErrorHandling(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: AuthenticatedRequest): Promise<NextResponse> => {
    try {
      return await handler(req)
    } catch (error: any) {
      console.error("API handler error:", error)

      // Handle specific error types
      if (error.name === "ValidationError") {
        return createAPIResponse(null, error.message, 400)
      }

      if (error.name === "UnauthorizedError") {
        return createAPIResponse(null, "Unauthorized", 401)
      }

      if (error.name === "ForbiddenError") {
        return createAPIResponse(null, "Forbidden", 403)
      }

      if (error.name === "NotFoundError") {
        return createAPIResponse(null, "Not found", 404)
      }

      // Generic server error
      return createAPIResponse(
        null,
        process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        500,
      )
    }
  }
}

export function withLogging(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const start = Date.now()
    const method = req.method
    const url = req.url

    console.log(`[${new Date().toISOString()}] ${method} ${url} - Started`)

    try {
      const response = await handler(req)
      const duration = Date.now() - start

      console.log(`[${new Date().toISOString()}] ${method} ${url} - ${response.status} (${duration}ms)`)

      return response
    } catch (error) {
      const duration = Date.now() - start
      console.error(`[${new Date().toISOString()}] ${method} ${url} - Error (${duration}ms):`, error)
      throw error
    }
  }
}

// Utility function to combine multiple middleware
export function combineMiddleware(...middlewares: Array<(handler: any) => any>) {
  return (handler: any) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
  }
}

// Additional utility functions for API responses
export function successResponse<T>(data: T, message?: string, status = 200): NextResponse {
  return createAPIResponse(data, null, status)
}

export function errorResponse(message: string, error?: any, status = 400): NextResponse {
  return createAPIResponse(null, message, status, { error })
}

export function validationErrorResponse(errors: any[], status = 400): NextResponse {
  return createAPIResponse(null, "Validation failed", status, { errors })
}

export function notFoundResponse(resource = "Resource", status = 404): NextResponse {
  return createAPIResponse(null, `${resource} not found`, status)
}

export function unauthorizedResponse(message = "Unauthorized", status = 401): NextResponse {
  return createAPIResponse(null, message, status)
}

export function forbiddenResponse(message = "Forbidden", status = 403): NextResponse {
  return createAPIResponse(null, message, status)
}

export function serverErrorResponse(message = "Internal server error", status = 500): NextResponse {
  return createAPIResponse(null, message, status)
}

// Content-Type validation middleware
export function withContentType(expectedType = "application/json") {
  return (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      const contentType = req.headers.get("content-type")

      if (req.method !== "GET" && req.method !== "DELETE" && !contentType?.includes(expectedType)) {
        return errorResponse(`Content-Type must be ${expectedType}`, null, 415)
      }

      return handler(req)
    }
  }
}

// Method validation middleware
export function withMethods(allowedMethods: string[]) {
  return (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      if (!allowedMethods.includes(req.method)) {
        return errorResponse(`Method ${req.method} not allowed`, null, 405)
      }

      return handler(req)
    }
  }
}

// Request size limit middleware
export function withSizeLimit(maxSizeBytes = 1024 * 1024) {
  // 1MB default
  return (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      const contentLength = req.headers.get("content-length")

      if (contentLength && Number.parseInt(contentLength) > maxSizeBytes) {
        return errorResponse("Request too large", null, 413)
      }

      return handler(req)
    }
  }
}
