import { type NextRequest, NextResponse } from "next/server"
import { authService } from "./lib/auth"
import { generateRandomString, securityHeaders, generateContentSecurityPolicy } from "./lib/security"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Generate a nonce for CSP using our custom function
  const nonce = generateRandomString(16)

  // Create response with security headers
  const response = NextResponse.next()

  // Add all security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add CSP header with nonce
  response.headers.set("Content-Security-Policy", generateContentSecurityPolicy(nonce))

  // Add nonce to request headers for use in components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/api/auth/signin",
    "/api/auth/signup",
    "/api/crypto/prices",
    "/api/crypto/news",
    "/api/crypto/trends",
    "/api/news",
    "/api-docs",
    "/api/health",
    "/api/test",
  ]

  // Admin routes
  const adminRoutes = ["/admin", "/api/admin"]

  // API routes that require authentication
  const protectedApiRoutes = ["/api/bots", "/api/trades", "/api/portfolio", "/api/user", "/api/subscription"]

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/bots", "/profile", "/subscription", "/integrations"]

  // Check if route is public
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return response
  }

  // Handle admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    const adminToken = request.cookies.get("admin-token")?.value

    if (!adminToken) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Admin authentication required" }, { status: 401 })
      }
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    const admin = await authService.verifyAdminToken(adminToken)
    if (!admin) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Invalid admin token" }, { status: 401 })
      }
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Handle protected routes
  const authToken = request.cookies.get("auth-token")?.value

  if (!authToken) {
    if (protectedApiRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const user = await authService.verifyAuthToken(authToken)
  if (!user) {
    if (protectedApiRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Add user info to headers for API routes
  if (pathname.startsWith("/api/")) {
    requestHeaders.set("x-user-id", user.id)
    requestHeaders.set("x-user-email", user.email)

    // Add CORS headers for API routes
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: response.headers })
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
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
