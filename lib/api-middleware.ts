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

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function createApiResponse<T>(success: boolean, data?: T, error?: string, message?: string): ApiResponse<T> {
  return { success, data, error, message }
}

export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return createApiResponse(true, data, undefined, message)
}

export function createErrorResponse(error: string, message?: string): ApiResponse {
  return createApiResponse(false, undefined, error, message)
}

export async function withAuth(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const token = req.cookies.get("auth-token")?.value || req.headers.get("authorization")?.replace("Bearer ", "")

      if (!token) {
        return NextResponse.json(createErrorResponse("Authentication required", "No token provided"), { status: 401 })
      }

      const user = await authService.verifyAuthToken(token)
      if (!user) {
        return NextResponse.json(createErrorResponse("Invalid token", "Authentication failed"), { status: 401 })
      }

      return handler(req, user)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return NextResponse.json(createErrorResponse("Authentication error", "Internal server error"), { status: 500 })
    }
  }
}

export async function withAdminAuth(handler: (req: NextRequest, admin: any) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const token = req.cookies.get("admin-token")?.value || req.headers.get("authorization")?.replace("Bearer ", "")

      if (!token) {
        return NextResponse.json(createErrorResponse("Admin authentication required", "No admin token provided"), {
          status: 401,
        })
      }

      const admin = await authService.verifyAdminToken(token)
      if (!admin) {
        return NextResponse.json(createErrorResponse("Invalid admin token", "Admin authentication failed"), {
          status: 401,
        })
      }

      return handler(req, admin)
    } catch (error) {
      console.error("Admin auth middleware error:", error)
      return NextResponse.json(createErrorResponse("Admin authentication error", "Internal server error"), {
        status: 500,
      })
    }
  }
}

export function withCors(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
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

export function withErrorHandling(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      return await handler(req)
    } catch (error) {
      console.error("API Error:", error)

      if (error instanceof Error) {
        return NextResponse.json(createErrorResponse(error.message, "Request failed"), { status: 500 })
      }

      return NextResponse.json(createErrorResponse("Unknown error", "Internal server error"), { status: 500 })
    }
  }
}

export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  limit = 100,
  windowMs = 60000, // 1 minute
) {
  const requests = new Map<string, { count: number; resetTime: number }>()

  return async (req: NextRequest) => {
    const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown"
    const now = Date.now()
    const windowStart = now - windowMs

    // Clean up old entries
    for (const [key, value] of requests.entries()) {
      if (value.resetTime < windowStart) {
        requests.delete(key)
      }
    }

    const current = requests.get(ip) || { count: 0, resetTime: now + windowMs }

    if (current.count >= limit && current.resetTime > now) {
      return NextResponse.json(createErrorResponse("Rate limit exceeded", "Too many requests"), {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": current.resetTime.toString(),
        },
      })
    }

    current.count++
    requests.set(ip, current)

    const response = await handler(req)

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", limit.toString())
    response.headers.set("X-RateLimit-Remaining", Math.max(0, limit - current.count).toString())
    response.headers.set("X-RateLimit-Reset", current.resetTime.toString())

    return response
  }
}

export function validateRequest(schema: any) {
  return (handler: (req: NextRequest, body: any) => Promise<NextResponse>) => async (req: NextRequest) => {
    try {
      const body = await req.json()

      // Basic validation - you can integrate with Zod or similar
      if (!body) {
        return NextResponse.json(createErrorResponse("Invalid request body", "Request body is required"), {
          status: 400,
        })
      }

      return handler(req, body)
    } catch (error) {
      return NextResponse.json(createErrorResponse("Invalid JSON", "Request body must be valid JSON"), {
        status: 400,
      })
    }
  }
}

export function combineMiddleware(...middlewares: any[]) {
  return (handler: any) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
  }
}

// Utility functions for common response patterns
export function jsonResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}

export function successResponse<T>(data: T, message?: string): NextResponse {
  return jsonResponse(createSuccessResponse(data, message))
}

export function errorResponse(error: string, message?: string, status = 400): NextResponse {
  return jsonResponse(createErrorResponse(error, message), status)
}

export function notFoundResponse(message = "Resource not found"): NextResponse {
  return errorResponse("Not found", message, 404)
}

export function unauthorizedResponse(message = "Unauthorized"): NextResponse {
  return errorResponse("Unauthorized", message, 401)
}

export function forbiddenResponse(message = "Forbidden"): NextResponse {
  return errorResponse("Forbidden", message, 403)
}

export function serverErrorResponse(message = "Internal server error"): NextResponse {
  return errorResponse("Server error", message, 500)
}

export function withSubscriptionCheck(
  handler: (req: NextRequest, user: any) => Promise<NextResponse>,
  requiredFeature?: string,
) {
  return async (req: NextRequest) => {
    try {
      const token = req.cookies.get("auth-token")?.value || req.headers.get("authorization")?.replace("Bearer ", "")

      if (!token) {
        return NextResponse.json(createErrorResponse("Authentication required", "No token provided"), { status: 401 })
      }

      const user = await authService.verifyAuthToken(token)
      if (!user) {
        return NextResponse.json(createErrorResponse("Invalid token", "Authentication failed"), { status: 401 })
      }

      // Admin bypass
      const admin = await adminManager.getCurrentAdmin()
      if (admin) {
        return handler(req, user)
      }

      // Check subscription access
      if (requiredFeature) {
        const hasAccess = await subscriptionManager.checkAccess(user.id, requiredFeature)
        if (!hasAccess) {
          return NextResponse.json(createErrorResponse("Subscription required", "Access denied"), { status: 403 })
        }
      }

      return handler(req, user)
    } catch (error) {
      console.error("Subscription check middleware error:", error)
      return NextResponse.json(createErrorResponse("Internal server error", "Request failed"), { status: 500 })
    }
  }
}
