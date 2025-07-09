import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "./lib/auth"
import { AdminService } from "./lib/admin"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/signin") ||
    pathname.startsWith("/api/auth/signup") ||
    pathname.startsWith("/api/admin/signin") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/api/subscription/webhook") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Admin routes protection
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const adminToken = request.cookies.get("admin-token")?.value

    if (!adminToken) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Admin authentication required" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/", request.url))
    }

    const adminSession = AdminService.verifyAdminToken(adminToken)
    if (!adminSession) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Invalid admin token" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
  }

  // Protected routes that require user authentication
  const protectedRoutes = ["/dashboard", "/bots", "/profile", "/subscription", "/integrations"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute || pathname.startsWith("/api/")) {
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/", request.url))
    }

    const userSession = AuthService.verifyToken(authToken)
    if (!userSession) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Add user info to headers for API routes
    if (pathname.startsWith("/api/")) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-user-id", userSession.userId)
      requestHeaders.set("x-user-email", userSession.email)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
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
