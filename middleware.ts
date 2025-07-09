import { type NextRequest, NextResponse } from "next/server"
import { authService } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/signin") ||
    pathname.startsWith("/api/auth/signup") ||
    pathname.startsWith("/api/admin/signin") ||
    pathname.startsWith("/api/crypto/prices") ||
    pathname.startsWith("/api/crypto/news") ||
    pathname.startsWith("/api/v1") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/bots", "/profile", "/subscription", "/integrations", "/news"]
  const adminRoutes = ["/admin"]

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // Check admin authentication
  if (isAdminRoute) {
    const adminToken = request.cookies.get("admin-token")?.value

    if (!adminToken) {
      return NextResponse.redirect(new URL("/?admin=login", request.url))
    }

    const admin = await authService.verifyAdminToken(adminToken)
    if (!admin) {
      return NextResponse.redirect(new URL("/?admin=login", request.url))
    }

    // Add admin info to headers for API routes
    const response = NextResponse.next()
    response.headers.set("x-admin-id", admin.id)
    response.headers.set("x-admin-username", admin.username)
    response.headers.set("x-admin-role", admin.role)
    return response
  }

  // Check user authentication for protected routes
  if (isProtectedRoute) {
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.redirect(new URL("/?login=required", request.url))
    }

    const user = await authService.verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.redirect(new URL("/?login=expired", request.url))
    }

    // Add user info to headers for API routes
    const response = NextResponse.next()
    response.headers.set("x-user-id", user.id)
    response.headers.set("x-user-email", user.email)
    response.headers.set("x-user-username", user.username)
    return response
  }

  // Handle API routes that need authentication
  if (pathname.startsWith("/api/")) {
    // Admin API routes
    if (pathname.startsWith("/api/admin/")) {
      const adminToken =
        request.cookies.get("admin-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

      if (!adminToken) {
        return NextResponse.json({ error: "Admin authentication required" }, { status: 401 })
      }

      const admin = await authService.verifyAdminToken(adminToken)
      if (!admin) {
        return NextResponse.json({ error: "Invalid admin token" }, { status: 401 })
      }

      // Add admin info to headers
      const response = NextResponse.next()
      response.headers.set("x-admin-id", admin.id)
      response.headers.set("x-admin-username", admin.username)
      response.headers.set("x-admin-role", admin.role)
      return response
    }

    // User API routes that need authentication
    const userApiRoutes = [
      "/api/bots",
      "/api/user",
      "/api/subscription",
      "/api/portfolio",
      "/api/trades",
      "/api/integrations",
    ]

    const needsUserAuth = userApiRoutes.some((route) => pathname.startsWith(route))

    if (needsUserAuth) {
      const authToken =
        request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

      if (!authToken) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      const user = await authService.verifyAuthToken(authToken)
      if (!user) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
      }

      // Add user info to headers
      const response = NextResponse.next()
      response.headers.set("x-user-id", user.id)
      response.headers.set("x-user-email", user.email)
      response.headers.set("x-user-username", user.username)
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
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
