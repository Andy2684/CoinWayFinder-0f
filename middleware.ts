import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /dashboard, /api/bots)
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/stripe") ||
    pathname.startsWith("/api/coinbase") ||
    pathname.includes(".") ||
    pathname === "/" ||
    pathname === "/subscription" ||
    pathname === "/subscription/success" ||
    pathname === "/subscription/cancel"
  ) {
    return NextResponse.next()
  }

  // Check for authentication token
  const token = request.cookies.get("auth-token")?.value

  if (
    !token &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/bots") || pathname.startsWith("/profile"))
  ) {
    // Redirect to home page if not authenticated
    return NextResponse.redirect(new URL("/", request.url))
  }

  // For API routes that need authentication
  if (pathname.startsWith("/api/") && !token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
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
