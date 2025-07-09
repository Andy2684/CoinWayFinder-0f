import { type NextRequest, NextResponse } from "next/server"
import { authService } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
  ]

  // Admin routes
  const adminRoutes = ["/admin", "/api/admin"]

  // API routes that require authentication
  const protectedApiRoutes = ["/api/bots", "/api/trades", "/api/portfolio", "/api/user", "/api/subscription"]

  // Check if route is public
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Handle admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    const adminToken = request.cookies.get("admin-token")?.value

    if (!adminToken) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Admin authentication required" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/", request.url))
    }

    const admin = await authService.verifyAdminToken(adminToken)
    if (!admin) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Invalid admin token" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
  }

  // Handle protected routes
  const authToken = request.cookies.get("auth-token")?.value

  if (!authToken) {
    if (protectedApiRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/", request.url))
  }

  const user = await authService.verifyAuthToken(authToken)
  if (!user) {
    if (protectedApiRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Add user info to headers for API routes
  if (pathname.startsWith("/api/")) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", user.id)
    requestHeaders.set("x-user-email", user.email)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
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
