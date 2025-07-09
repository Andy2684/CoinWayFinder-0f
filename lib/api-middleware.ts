import { type NextRequest, NextResponse } from "next/server"
import { authManager } from "./auth"
import { adminManager } from "./admin"

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface AuthenticatedRequest extends NextRequest {
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

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown"
  return ip
}

function checkRateLimit(key: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

export function withAPIAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    requireAdmin?: boolean
    rateLimit?: { requests: number; windowMs: number }
  } = {},
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // CORS headers
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }

      // Handle preflight requests
      if (request.method === "OPTIONS") {
        return new NextResponse(null, { status: 200, headers: corsHeaders })
      }

      // Rate limiting
      if (options.rateLimit) {
        const rateLimitKey = getRateLimitKey(request)
        const allowed = checkRateLimit(rateLimitKey, options.rateLimit.requests, options.rateLimit.windowMs)

        if (!allowed) {
          return NextResponse.json(
            { success: false, error: "Rate limit exceeded" },
            { status: 429, headers: corsHeaders },
          )
        }
      }

      const authenticatedRequest = request as AuthenticatedRequest

      // Admin authentication
      if (options.requireAdmin) {
        const authHeader = request.headers.get("authorization")
        const token = authHeader?.replace("Bearer ", "")

        if (!token) {
          return NextResponse.json(
            { success: false, error: "Admin token required" },
            { status: 401, headers: corsHeaders },
          )
        }

        const admin = await adminManager.verifyToken(token)
        if (!admin) {
          return NextResponse.json(
            { success: false, error: "Invalid admin token" },
            { status: 401, headers: corsHeaders },
          )
        }

        authenticatedRequest.admin = admin
      }

      // User authentication
      if (options.requireAuth && !options.requireAdmin) {
        const authHeader = request.headers.get("authorization")
        const token = authHeader?.replace("Bearer ", "")

        if (!token) {
          return NextResponse.json(
            { success: false, error: "Authentication required" },
            { status: 401, headers: corsHeaders },
          )
        }

        const decoded = authManager.verifyToken(token)
        if (!decoded) {
          return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401, headers: corsHeaders })
        }

        authenticatedRequest.user = decoded
      }

      // Call the handler
      const response = await handler(authenticatedRequest)

      // Add CORS headers to response
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    } catch (error) {
      console.error("API middleware error:", error)
      return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  }
}

export function withGracefulExpiration(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return withAPIAuth(
    async (request: AuthenticatedRequest) => {
      try {
        // Check if user's subscription has expired
        if (request.user?.subscription) {
          const { subscription } = request.user
          const now = new Date()

          // Check trial expiration
          if (subscription.status === "trial" && subscription.trialEndsAt && subscription.trialEndsAt < now) {
            // Gracefully handle expired trial
            request.user.subscription = {
              ...subscription,
              status: "inactive",
              plan: "free",
            }
          }

          // Check subscription expiration
          if (subscription.status === "active" && subscription.expiresAt && subscription.expiresAt < now) {
            // Gracefully handle expired subscription
            request.user.subscription = {
              ...subscription,
              status: "inactive",
              plan: "free",
            }
          }
        }

        return await handler(request)
      } catch (error) {
        console.error("Graceful expiration middleware error:", error)
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
      }
    },
    { requireAuth: true },
  )
}

// Helper functions for API responses
export function successResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message,
  })
}

export function errorResponse(error: string, status = 400): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status },
  )
}

export function validationErrorResponse(errors: Record<string, string>): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: "Validation failed",
      errors,
    },
    { status: 400 },
  )
}

// Cleanup rate limit store every 5 minutes
setInterval(
  () => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  },
  5 * 60 * 1000,
)
