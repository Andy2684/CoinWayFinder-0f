import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "./lib/auth"
import { AdminService } from "./lib/admin"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/subscription/webhook") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    const adminToken = request.cookies.get("admin-token")?.value

    if (!adminToken) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    const adminSession = AdminService.verifyAdminToken(adminToken)
    if (!adminSession || adminSession.expiresAt < Date.now()) {
      const response = NextResponse.redirect(new URL("/", request.url))
      response.cookies.delete("admin-token")
      return response
    }

    return NextResponse.next()
  }

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/bots", "/integrations", "/profile", "/subscription"]

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    const userSession = AuthService.verifyToken(authToken)
    if (!userSession || userSession.expiresAt < Date.now()) {
      const response = NextResponse.redirect(new URL("/", request.url))
      response.cookies.delete("auth-token")
      return response
    }

    return NextResponse.next()
  }

  // API routes protection
  if (pathname.startsWith("/api/")) {
    // Skip auth for public API routes
    const publicAPIRoutes = [
      "/api/crypto/prices",
      "/api/crypto/news",
      "/api/news",
      "/api/test-connection",
      "/api/analyze-sentiment",
    ]

    if (publicAPIRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next()
    }

    // Admin API routes
    if (pathname.startsWith("/api/admin")) {
      const adminToken =
        request.cookies.get("admin-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

      if (!adminToken) {
        return NextResponse.json({ error: "Admin authentication required" }, { status: 401 })
      }

      const adminSession = AdminService.verifyAdminToken(adminToken)
      if (!adminSession || adminSession.expiresAt < Date.now()) {
        return NextResponse.json({ error: "Invalid or expired admin token" }, { status: 401 })
      }

      return NextResponse.next()
    }

    // User API routes
    const authToken =
      request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!authToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userSession = AuthService.verifyToken(authToken)
    if (!userSession || userSession.expiresAt < Date.now()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
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
