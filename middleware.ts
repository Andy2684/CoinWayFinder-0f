import { type NextRequest, NextResponse } from "next/server"

// Simple JWT implementation without external dependencies
function createToken(payload: any, secret: string, expiresIn = "24h"): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  const now = Math.floor(Date.now() / 1000)
  const exp = expiresIn === "24h" ? now + 24 * 60 * 60 : now + Number.parseInt(expiresIn)

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
    if (parts.length !== 3) return null

    const [encodedHeader, encodedPayload, signature] = parts

    // Decode payload
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/")))

    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return null
    }

    // Verify signature (simplified)
    const expectedSignature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`)
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
    if (signature !== expectedSignature) {
      return null
    }

    return payload
  } catch (error) {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/api/auth/signin",
    "/api/auth/signup",
    "/api/admin/signin",
    "/api/stripe/webhook",
    "/api/subscription/webhook",
    "/api/telegram-webhook",
  ]

  // API routes that require authentication
  const protectedApiRoutes = [
    "/api/auth/me",
    "/api/auth/signout",
    "/api/bots",
    "/api/portfolio",
    "/api/trades",
    "/api/user",
    "/api/subscription",
    "/api/crypto",
    "/api/news",
  ]

  // Admin routes
  const adminRoutes = ["/api/admin/me", "/api/admin/users", "/api/admin/signout"]

  // Dashboard routes
  const dashboardRoutes = ["/dashboard", "/bots", "/integrations", "/profile", "/subscription", "/news"]

  // Check if route is public
  if (publicRoutes.includes(pathname) || pathname.startsWith("/api/v1/")) {
    return NextResponse.next()
  }

  // Get token from cookie or Authorization header
  const token = request.cookies.get("auth-token")?.value || request.headers.get("Authorization")?.replace("Bearer ", "")

  if (!token) {
    if (dashboardRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    if (protectedApiRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Verify token
  const payload = verifyToken(token, process.env.JWT_SECRET || "your-secret-key")
  if (!payload) {
    if (dashboardRoutes.some((route) => pathname.startsWith(route))) {
      const response = NextResponse.redirect(new URL("/", request.url))
      response.cookies.delete("auth-token")
      return response
    }
    if (
      protectedApiRoutes.some((route) => pathname.startsWith(route)) ||
      adminRoutes.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Check admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!payload.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
  }

  // Check subscription status for protected routes
  if (
    dashboardRoutes.some((route) => pathname.startsWith(route)) ||
    protectedApiRoutes.some((route) => pathname.startsWith(route))
  ) {
    // Allow access but the individual route handlers will check subscription limits
    const response = NextResponse.next()
    response.headers.set("x-user-id", payload.userId)
    response.headers.set("x-user-email", payload.email)
    response.headers.set("x-is-admin", payload.isAdmin ? "true" : "false")
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
}
