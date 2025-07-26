import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

// Define protected routes
const protectedRoutes = ["/dashboard", "/admin", "/profile", "/bots", "/signals", "/portfolio", "/integrations"]
const adminRoutes = ["/admin"]
const authRoutes = ["/auth/login", "/auth/signup"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get token from cookie or Authorization header
  const token = request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // If no token and trying to access protected route
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If token exists, verify it
  if (token) {
    const decoded = verifyToken(token)

    // Invalid token - redirect to login
    if (!decoded) {
      const response = NextResponse.redirect(new URL("/auth/login", request.url))
      response.cookies.delete("auth-token")
      return response
    }

    // For admin routes, we need to check user role
    if (isAdminRoute) {
      try {
        // Make a request to get user data
        const userResponse = await fetch(new URL("/api/auth/me", request.url), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          if (userData.user?.role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", request.url))
          }
        } else {
          return NextResponse.redirect(new URL("/auth/login", request.url))
        }
      } catch (error) {
        console.error("Admin check error:", error)
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }
    }

    // If authenticated user tries to access auth pages, redirect to dashboard
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
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
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
