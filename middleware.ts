import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { authService } from "./lib/auth"

// Define protected routes
const protectedRoutes = [
  "/dashboard",
  "/bots",
  "/integrations",
  "/profile",
  "/subscription",
  "/api/bots",
  "/api/trades",
  "/api/user",
  "/api/subscription",
]

const adminRoutes = ["/admin", "/api/admin"]

const publicRoutes = [
  "/",
  "/api/auth",
  "/api/stripe/webhook",
  "/api/v1", // Public API routes
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check if route is admin
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isAdminRoute) {
    // Check admin authentication
    const adminToken = request.cookies.get("admin-token")?.value

    if (!adminToken) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    try {
      const admin = await authService.verifyAdminToken(adminToken)
      if (!admin) {
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  } else if (isProtectedRoute) {
    // Check user authentication
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    try {
      const user = await authService.verifyAuthToken(authToken)
      if (!user) {
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/", request.url))
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
