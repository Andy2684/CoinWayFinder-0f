import { type NextRequest, NextResponse } from "next/server"
import { authManager } from "./lib/auth"
import { adminManager } from "./lib/admin"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/signin") ||
    pathname.startsWith("/api/auth/signup") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/api/coinbase/webhook") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Admin routes
  if (pathname.startsWith("/admin")) {
    const admin = await adminManager.getCurrentAdmin()

    if (!admin) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
  }

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/bots", "/profile", "/subscription", "/integrations", "/news"]

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const user = await authManager.getCurrentUser()

    if (!user) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // API routes that require authentication
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    const authHeader = request.headers.get("authorization")
    const cookieToken = request.cookies.get("auth-token")?.value

    if (!authHeader && !cookieToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
