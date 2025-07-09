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

    // Verify signature (simplified)
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth-token")?.value

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/api/auth/signin", "/api/auth/signup", "/api/telegram-webhook"]

  // Admin routes
  const adminRoutes = ["/admin", "/api/admin"]

  // Protected routes
  const protectedRoutes = ["/dashboard", "/bots", "/integrations", "/profile", "/subscription", "/news"]

  // API routes that require authentication
  const protectedApiRoutes = [
    "/api/bots",
    "/api/trades",
    "/api/portfolio",
    "/api/user",
    "/api/subscription",
    "/api/stripe",
    "/api/auth/me",
    "/api/auth/signout",
  ]

  // Check if route is public
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) ||
    protectedApiRoutes.some((route) => pathname.startsWith(route)) ||
    adminRoutes.some((route) => pathname.startsWith(route))
  ) {
    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Verify token
    const payload = verifyToken(token, process.env.JWT_SECRET || "default-secret")
    if (!payload) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
      // Clear invalid token and redirect
      const response = NextResponse.redirect(new URL("/", request.url))
      response.cookies.delete("auth-token")
      return response
    }

    // Check admin access
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      if (!payload.isAdmin) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Admin access required" }, { status: 403 })
        }
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    // Check subscription status for premium features
    if (pathname.startsWith("/bots") || pathname.startsWith("/api/bots")) {
      const now = new Date()
      const subscriptionExpiry = payload.subscriptionExpiry ? new Date(payload.subscriptionExpiry) : null

      // Allow access but with limitations for expired subscriptions
      if (subscriptionExpiry && subscriptionExpiry < now) {
        // Add header to indicate expired subscription
        const response = NextResponse.next()
        response.headers.set("X-Subscription-Status", "expired")
        return response
      }
    }

    // Add user info to headers for API routes
    if (pathname.startsWith("/api/")) {
      const response = NextResponse.next()
      response.headers.set("X-User-Id", payload.userId)
      response.headers.set("X-User-Email", payload.email)
      response.headers.set("X-User-Subscription", payload.subscription || "free")
      response.headers.set("X-Is-Admin", payload.isAdmin ? "true" : "false")
      return response
    }
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
     * - image files (png, jpg, jpeg, gif, svg)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
}

// Export helper functions for use in API routes
export { createToken, verifyToken }
