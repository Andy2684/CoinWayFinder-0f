import { type NextRequest, NextResponse } from "next/server"
import { authService } from "./auth"
import { adminManager } from "./admin"
import { subscriptionManager } from "./subscription-manager"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    username: string
    isActive: boolean
  }
  admin?: {
    id: string
    username: string
    role: "admin"
  }
}

export function createResponse(data: any, status = 200) {
  return NextResponse.json(data, { status })
}

export function createErrorResponse(message: string, status = 400) {
  return NextResponse.json({ error: { message } }, { status })
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // Get token from cookie or Authorization header
      const cookieToken = req.cookies.get("auth-token")?.value
      const headerToken = req.headers.get("authorization")?.replace("Bearer ", "")
      const token = cookieToken || headerToken

      if (!token) {
        return createErrorResponse("Authentication required", 401)
      }

      // Verify token and get user
      const user = await authService.verifyAuthToken(token)
      if (!user) {
        return createErrorResponse("Invalid or expired token", 401)
      }

      // Add user to request
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = user

      return handler(authenticatedReq)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return createErrorResponse("Authentication failed", 500)
    }
  }
}

export function withAdminAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // Get admin token from cookie or Authorization header
      const cookieToken = req.cookies.get("admin-token")?.value
      const headerToken = req.headers.get("authorization")?.replace("Bearer ", "")
      const token = cookieToken || headerToken

      if (!token) {
        return createErrorResponse("Admin authentication required", 401)
      }

      // Verify admin token
      const admin = await authService.verifyAdminToken(token)
      if (!admin) {
        return createErrorResponse("Invalid or expired admin token", 401)
      }

      // Add admin to request
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.admin = admin

      return handler(authenticatedReq)
    } catch (error) {
      console.error("Admin auth middleware error:", error)
      return createErrorResponse("Admin authentication failed", 500)
    }
  }
}

export function withAPIAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // Get API key from header
      const apiKey = req.headers.get("x-api-key")

      if (!apiKey) {
        return createErrorResponse("API key required", 401)
      }

      // Validate API key (implement your API key validation logic)
      // For now, we'll use a simple check
      if (apiKey !== process.env.API_SECRET_KEY) {
        return createErrorResponse("Invalid API key", 401)
      }

      return handler(req as AuthenticatedRequest)
    } catch (error) {
      console.error("API auth middleware error:", error)
      return createErrorResponse("API authentication failed", 500)
    }
  }
}

export function withCORS(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
        },
      })
    }

    const response = await handler(req)

    // Add CORS headers to response
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key")

    return response
  }
}

export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: { maxRequests: number; windowMs: number } = { maxRequests: 100, windowMs: 60000 },
) {
  const requests = new Map<string, { count: number; resetTime: number }>()

  return async (req: NextRequest) => {
    const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown"
    const now = Date.now()
    const windowStart = now - options.windowMs

    // Clean up old entries
    for (const [key, value] of requests.entries()) {
      if (value.resetTime < windowStart) {
        requests.delete(key)
      }
    }

    // Get or create request count for this IP
    const requestData = requests.get(ip) || { count: 0, resetTime: now + options.windowMs }

    // Check if rate limit exceeded
    if (requestData.count >= options.maxRequests && requestData.resetTime > now) {
      return createErrorResponse("Rate limit exceeded", 429)
    }

    // Increment request count
    requestData.count++
    requests.set(ip, requestData)

    return handler(req)
  }
}

export function withGracefulExpiration(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: AuthenticatedRequest) => {
    try {
      return await handler(req)
    } catch (error: any) {
      // Handle token expiration gracefully
      if (error.message?.includes("expired") || error.message?.includes("invalid")) {
        return createErrorResponse("Session expired. Please login again.", 401)
      }

      console.error("Request handler error:", error)
      return createErrorResponse("Internal server error", 500)
    }
  }
}

export function withErrorHandling(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      return await handler(req)
    } catch (error: any) {
      console.error("API Error:", error)

      // Handle specific error types
      if (error.name === "ValidationError") {
        return createErrorResponse(error.message, 400)
      }

      if (error.name === "UnauthorizedError") {
        return createErrorResponse("Unauthorized", 401)
      }

      if (error.name === "ForbiddenError") {
        return createErrorResponse("Forbidden", 403)
      }

      if (error.name === "NotFoundError") {
        return createErrorResponse("Resource not found", 404)
      }

      // Generic error response
      return createErrorResponse("Internal server error", 500)
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

export function withSubscriptionCheck(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  requiredFeature?: string,
) {
  return withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
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
        const hasAccess = await subscriptionManager.checkAccess(user.id, requiredFeature)
        if (!hasAccess) {
          return createErrorResponse("Subscription required", 403)
        }
      }

      return handler(req)
    } catch (error) {
      console.error("Subscription check middleware error:", error)
      return createErrorResponse("Internal server error", 500)
    }
  })
}

// Additional utility functions for API responses
export function successResponse<T>(data: T, message?: string, status = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status },
  )
}

export function errorResponse(message: string, error?: any, status = 400): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details: error,
    },
    { status },
  )
}

export function validationErrorResponse(errors: any[], status = 400): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: "Validation failed",
      errors,
    },
    { status },
  )
}

export function notFoundResponse(resource = "Resource", status = 404): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: `${resource} not found`,
    },
    { status },
  )
}

export function unauthorizedResponse(message = "Unauthorized", status = 401): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  )
}

export function forbiddenResponse(message = "Forbidden", status = 403): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  )
}

export function serverErrorResponse(message = "Internal server error", status = 500): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  )
}

// Request validation middleware
export function withValidation(schema: any) {
  return (handler: (req: NextRequest, body: any) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      try {
        const body = await req.json()

        // Basic validation - you can integrate with Zod or similar validation library
        if (!body) {
          return validationErrorResponse([{ field: "body", message: "Request body is required" }])
        }

        return handler(req, body)
      } catch (error) {
        return validationErrorResponse([{ field: "body", message: "Invalid JSON format" }])
      }
    }
  }
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
