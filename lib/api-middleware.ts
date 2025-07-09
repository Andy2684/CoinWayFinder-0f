import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "./auth"
import { adminManager } from "./admin"
import { database } from "./database"
import { subscriptionManager } from "./subscription-manager"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    username: string
  }
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function createResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  status = 200,
): NextResponse<APIResponse<T>> {
  return NextResponse.json(
    {
      success,
      data,
      error,
      message: error || (success ? "Success" : "Error"),
    },
    { status },
  )
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const user = await AuthService.getCurrentUser()
      if (!user) {
        return createResponse(false, null, "Authentication required", 401)
      }

      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        userId: user.userId,
        email: user.email,
        username: user.username,
      }

      return await handler(authenticatedReq)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return createResponse(false, null, "Authentication failed", 401)
    }
  }
}

export function withAdminAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const admin = await adminManager.getCurrentAdmin()
      if (!admin) {
        return createResponse(false, null, "Admin authentication required", 401)
      }

      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        userId: admin.adminId,
        email: admin.email,
        username: admin.username,
      }

      return await handler(authenticatedReq)
    } catch (error) {
      console.error("Admin auth middleware error:", error)
      return createResponse(false, null, "Admin authentication failed", 401)
    }
  }
}

export function withAPIAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Check for API key in headers
      const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "")

      if (apiKey) {
        // Validate API key
        const keyData = await database.getAPIKey(apiKey)
        if (keyData && keyData.isActive) {
          const authenticatedReq = req as AuthenticatedRequest
          authenticatedReq.user = {
            userId: keyData.userId,
            email: keyData.email || "",
            username: keyData.name || "API User",
          }
          return await handler(authenticatedReq)
        }
      }

      // Fall back to session auth
      const user = await AuthService.getCurrentUser()
      if (!user) {
        return createResponse(false, null, "Authentication required", 401)
      }

      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        userId: user.userId,
        email: user.email,
        username: user.username,
      }

      return await handler(authenticatedReq)
    } catch (error) {
      console.error("API auth middleware error:", error)
      return createResponse(false, null, "Authentication failed", 401)
    }
  }
}

export function withGracefulExpiration(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req)
    } catch (error: any) {
      if (error.message === "Authentication required" || error.message?.includes("token")) {
        return createResponse(false, null, "Session expired. Please sign in again.", 401)
      }
      throw error
    }
  }
}

export function withCORS(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
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

export function withRateLimit(handler: (req: NextRequest) => Promise<NextResponse>, limit = 100, windowMs = 60000) {
  const requests = new Map<string, { count: number; resetTime: number }>()

  return async (req: NextRequest): Promise<NextResponse> => {
    const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown"
    const now = Date.now()
    const windowStart = now - windowMs

    // Clean up old entries
    for (const [key, value] of requests.entries()) {
      if (value.resetTime < windowStart) {
        requests.delete(key)
      }
    }

    // Check current request count
    const current = requests.get(ip) || { count: 0, resetTime: now + windowMs }

    if (current.count >= limit && current.resetTime > now) {
      return createResponse(false, null, "Rate limit exceeded", 429)
    }

    // Update request count
    current.count++
    requests.set(ip, current)

    return await handler(req)
  }
}

export function withErrorHandling(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req)
    } catch (error: any) {
      console.error("API Error:", error)

      if (error.message === "Authentication required") {
        return createResponse(false, null, "Authentication required", 401)
      }

      if (error.message === "Access denied") {
        return createResponse(false, null, "Access denied", 403)
      }

      return createResponse(false, null, "Internal server error", 500)
    }
  }
}

// Utility function to combine multiple middleware
export function withMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse>,
  ...middlewares: Array<
    (handler: (req: NextRequest) => Promise<NextResponse>) => (req: NextRequest) => Promise<NextResponse>
  >
) {
  return middlewares.reduce((acc, middleware) => middleware(acc), handler)
}

export function withSubscriptionCheck(handler: (req: NextRequest) => Promise<NextResponse>, requiredFeature?: string) {
  return withAPIAuth(async (req: NextRequest): Promise<NextResponse> => {
    try {
      const user = req.user
      if (!user) {
        return createResponse(false, null, "Authentication required", 401)
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
          return createResponse(false, null, "Subscription required", 403)
        }
      }

      return handler(req)
    } catch (error) {
      console.error("Subscription check middleware error:", error)
      return createResponse(false, null, "Internal server error", 500)
    }
  })
}
