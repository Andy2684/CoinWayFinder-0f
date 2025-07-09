import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "./auth"
import { AdminService } from "./admin"

interface APIResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

interface AuthConfig {
  required?: boolean
  adminRequired?: boolean
  rateLimiting?: RateLimitConfig
}

// Simple in-memory rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown"
  return `${ip}:${request.nextUrl.pathname}`
}

function checkRateLimit(key: string, config: RateLimitConfig): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return true
  }

  if (record.count >= config.maxRequests) {
    return false
  }

  record.count++
  return true
}

export function withAPIAuth(config: AuthConfig = {}) {
  return (handler: (request: NextRequest, context?: any) => Promise<NextResponse>) =>
    async (request: NextRequest, context?: any): Promise<NextResponse> => {
      try {
        // CORS handling
        if (request.method === "OPTIONS") {
          return new NextResponse(null, {
            status: 200,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          })
        }

        // Rate limiting
        if (config.rateLimiting) {
          const rateLimitKey = getRateLimitKey(request)
          if (!checkRateLimit(rateLimitKey, config.rateLimiting)) {
            return NextResponse.json(
              { success: false, error: "Rate limit exceeded" },
              {
                status: 429,
                headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Retry-After": Math.ceil(config.rateLimiting.windowMs / 1000).toString(),
                },
              },
            )
          }
        }

        // Authentication check
        if (config.required || config.adminRequired) {
          const authHeader = request.headers.get("authorization")
          const token = authHeader?.replace("Bearer ", "")

          if (!token) {
            return NextResponse.json(
              { success: false, error: "Authentication token required" },
              {
                status: 401,
                headers: { "Access-Control-Allow-Origin": "*" },
              },
            )
          }

          if (config.adminRequired) {
            const adminSession = AdminService.verifyAdminToken(token)
            if (!adminSession) {
              return NextResponse.json(
                { success: false, error: "Admin authentication required" },
                {
                  status: 403,
                  headers: { "Access-Control-Allow-Origin": "*" },
                },
              )
            }
            // Add admin session to request context
            ;(request as any).adminSession = adminSession
          } else {
            const userSession = AuthService.verifyToken(token)
            if (!userSession) {
              return NextResponse.json(
                { success: false, error: "Invalid or expired token" },
                {
                  status: 401,
                  headers: { "Access-Control-Allow-Origin": "*" },
                },
              )
            }
            // Add user session to request context
            ;(request as any).userSession = userSession
          }
        }

        // Call the actual handler
        const response = await handler(request, context)

        // Add CORS headers to response
        response.headers.set("Access-Control-Allow-Origin", "*")
        response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

        return response
      } catch (error) {
        console.error("API middleware error:", error)
        return NextResponse.json(
          { success: false, error: "Internal server error" },
          {
            status: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
          },
        )
      }
    }
}

export function withGracefulExpiration(handler: (request: NextRequest) => Promise<NextResponse>) {
  return withAPIAuth({ required: true })(async (request: NextRequest) => {
    try {
      const userSession = (request as any).userSession

      // Check if token is expiring soon (within 24 hours)
      const timeUntilExpiry = userSession.expiresAt - Date.now()
      const twentyFourHours = 24 * 60 * 60 * 1000

      const response = await handler(request)

      if (timeUntilExpiry < twentyFourHours) {
        // Add header to indicate token is expiring soon
        response.headers.set("X-Token-Expiring", "true")
        response.headers.set("X-Token-Expires-At", userSession.expiresAt.toString())
      }

      return response
    } catch (error) {
      console.error("Graceful expiration middleware error:", error)
      return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

// Helper function to create standardized API responses
export function createAPIResponse(success: boolean, data?: any, error?: string, status = 200): NextResponse {
  const response: APIResponse = { success }

  if (success && data !== undefined) {
    response.data = data
  }

  if (!success && error) {
    response.error = error
  }

  return NextResponse.json(response, {
    status,
    headers: { "Access-Control-Allow-Origin": "*" },
  })
}

// Helper to extract user session from request
export function getUserSession(request: NextRequest) {
  return (request as any).userSession
}

// Helper to extract admin session from request
export function getAdminSession(request: NextRequest) {
  return (request as any).adminSession
}
