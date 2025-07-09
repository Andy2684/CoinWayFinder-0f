import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here"

interface JWTPayload {
  userId: string
  email: string
  isAdmin?: boolean
  iat?: number
  exp?: number
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public routes
  const publicRoutes = [
    "/",
    "/api/auth/signin",
    "/api/auth/signup",
    "/api/stripe/webhook",
    "/api/coinbase/webhook",
    "/api/telegram-webhook",
  ]

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") ||
    publicRoutes.includes(pathname)
  ) {
    return NextResponse.next()
  }

  // Get token from cookie or Authorization header
  const token = request.cookies.get("auth-token")?.value || request.headers.get("Authorization")?.replace("Bearer ", "")

  // Redirect to home if no token for protected routes
  if (
    !token &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/bots") || pathname.startsWith("/profile"))
  ) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Verify token if present
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload

      // Add user info to request headers for API routes
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-user-id", decoded.userId)
      requestHeaders.set("x-user-email", decoded.email)
      if (decoded.isAdmin) {
        requestHeaders.set("x-user-admin", "true")
      }

      // Check admin routes
      if (pathname.startsWith("/api/admin") && !decoded.isAdmin) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 })
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      // Invalid token - clear cookie and redirect for protected routes
      if (pathname.startsWith("/dashboard") || pathname.startsWith("/bots") || pathname.startsWith("/profile")) {
        const response = NextResponse.redirect(new URL("/", request.url))
        response.cookies.delete("auth-token")
        return response
      }

      // For API routes, return 401
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
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
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
