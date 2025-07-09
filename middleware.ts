import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /dashboard, /api/bots)
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes that don't need auth
  const publicRoutes = ["/", "/api/auth/signin", "/api/auth/signup"]
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for authentication token
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    // Redirect to home page if not authenticated
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/bots") || pathname.startsWith("/profile")) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // For API routes that need authentication
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token!, JWT_SECRET) as any

    // Add user info to request headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", decoded.userId)
    requestHeaders.set("x-user-email", decoded.email)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    // Invalid token - redirect or return error
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/bots") || pathname.startsWith("/profile")) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
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
     * - public (public routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
