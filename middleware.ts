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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth-token")?.value
  const adminToken = request.cookies.get("admin-token")?.value

  // Add CORS headers for API routes
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next()

    // Add CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: response.headers })
    }

    return response
  }

  // Redirect root to dashboard if authenticated
  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Protect admin routes
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  if (isAdminRoute) {
    if (!adminToken) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // Protect authenticated routes
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL("/", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

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
      const loginUrl = new URL("/", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
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
