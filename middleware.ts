import { type NextRequest, NextResponse } from "next/server"

// Simple JWT implementation without external dependencies
function createToken(payload: any, secret: string, expiresIn = "24h"): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  const now = Math.floor(Date.now() / 1000)
  const exp = now + (expiresIn === "24h" ? 24 * 60 * 60 : 60 * 60) // 24 hours or 1 hour

  const jwtPayload = {
    ...payload,
    iat: now,
    exp: exp,
  }

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
  const encodedPayload = btoa(JSON.stringify(jwtPayload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")

  const signature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

function verifyToken(token: string, secret: string): any {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      return null
    }

    const [encodedHeader, encodedPayload, signature] = parts

    // Verify signature
    const expectedSignature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`)
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")

    if (signature !== expectedSignature) {
      return null
    }

    // Decode payload
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/")))

    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return null
    }

    return payload
  } catch (error) {
    return null
  }
}

// Protected routes configuration
const protectedRoutes = ["/dashboard", "/bots", "/integrations", "/profile", "/subscription"]
const adminRoutes = ["/admin"]
const authRoutes = ["/auth", "/login", "/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth-token")?.value

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Verify token if present
  let user = null
  if (token) {
    user = verifyToken(token, process.env.JWT_SECRET || "default-secret-key")
  }

  // Handle admin routes
  if (isAdminRoute) {
    if (!user || !user.isAdmin) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // Handle protected routes
  if (isProtectedRoute) {
    if (!user) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Check subscription status for non-admin users
    if (!user.isAdmin) {
      const subscriptionExpiry = user.subscriptionExpiry ? new Date(user.subscriptionExpiry) : null
      const isExpired = subscriptionExpiry && subscriptionExpiry < new Date()

      // Allow access to subscription page even if expired
      if (isExpired && !pathname.startsWith("/subscription")) {
        // Graceful expiration - redirect to subscription page but don't block completely
        const response = NextResponse.redirect(new URL("/subscription", request.url))
        response.cookies.set("subscription-expired", "true", { maxAge: 60 * 60 * 24 }) // 24 hours
        return response
      }
    }

    return NextResponse.next()
  }

  // Handle auth routes (redirect if already logged in)
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Handle API routes
  if (pathname.startsWith("/api/")) {
    // Public API routes
    const publicApiRoutes = [
      "/api/auth/signin",
      "/api/auth/signup",
      "/api/crypto/prices",
      "/api/crypto/news",
      "/api/stripe/webhook",
      "/api/telegram-webhook",
    ]

    const isPublicApi = publicApiRoutes.some((route) => pathname.startsWith(route))

    if (!isPublicApi) {
      // Protected API routes require authentication
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      // Admin API routes
      if (pathname.startsWith("/api/admin/") && !user.isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      // Check API usage limits for non-admin users
      if (!user.isAdmin && !pathname.startsWith("/api/auth/")) {
        // Add API usage tracking here if needed
        // For now, we'll allow all authenticated requests
      }
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}

// Export helper functions for use in API routes
export { createToken, verifyToken }
