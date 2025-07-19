import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Protected routes that require authentication
const protectedRoutes = ["/dashboard"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    try {
      // Verify the token
      jwt.verify(token, JWT_SECRET)
      return NextResponse.next()
    } catch (error) {
      // Invalid token, redirect to login
      const response = NextResponse.redirect(new URL("/auth/login", request.url))
      response.cookies.delete("auth-token")
      return response
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
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
