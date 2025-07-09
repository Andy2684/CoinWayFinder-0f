import { type NextRequest, NextResponse } from "next/server"
import { authManager } from "./auth"
import { adminManager } from "./admin"
import { subscriptionManager } from "./subscription-manager"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    name: string
    isAdmin?: boolean
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
          id: admin.userId,
          email: admin.email,
          name: admin.username,
          isAdmin: true,
        }
      } else {
        // Check for regular user authentication
        const user = await authManager.getCurrentUser()
        if (user) {
          authenticatedReq.user = user
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

      // Admin bypass
      if (req.admin) {
        return await handler(req)
      }

      // Check subscription access
      if (feature) {
        const hasAccess = await subscriptionManager.checkAccess(req.user.id, feature)
        if (!hasAccess) {
          return NextResponse.json(
            {
              error: "Subscription upgrade required",
              message: `This feature requires a subscription upgrade`,
              feature,
            },
            { status: 402 },
          )
        }
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

      // Admin bypass
      if (req.admin) {
        return await handler(req)
      }

      // Simple in-memory rate limiting (in production, use Redis)
      const key = `rate_limit:${req.user.id}`
      // This would be implemented with a proper rate limiting solution

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
