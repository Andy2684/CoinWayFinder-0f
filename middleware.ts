import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "./lib/auth"
import { AdminService } from "./lib/admin"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/api/telegram-webhook") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    try {
      const admin = await AdminService.getCurrentAdmin()
      if (!admin) {
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/bots", "/profile", "/subscription", "/integrations", "/news"]

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    try {
      const user = await AuthService.getCurrentUser()
      if (!user) {
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // API routes protection
  if (pathname.startsWith("/api/")) {
    // Skip auth for public API routes
    const publicAPIRoutes = [
      "/api/crypto/prices",
      "/api/crypto/news",
      "/api/crypto/trends",
      "/api/news",
      "/api/whales",
      "/api/v1/trends",
      "/api/v1/whales",
    ]

    if (publicAPIRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    // Admin API routes
    if (pathname.startsWith("/api/admin/")) {
      try {
        const admin = await AdminService.getCurrentAdmin()
        if (!admin) {
          return NextResponse.json({ error: "Admin authentication required" }, { status: 401 })
        }
      } catch (error) {
        return NextResponse.json({ error: "Admin authentication required" }, { status: 401 })
      }
    }

    // User API routes
    if (
      pathname.startsWith("/api/user/") ||
      pathname.startsWith("/api/bots/") ||
      pathname.startsWith("/api/portfolio/") ||
      pathname.startsWith("/api/subscription/") ||
      pathname.startsWith("/api/trades/")
    ) {
      try {
        const user = await AuthService.getCurrentUser()
        if (!user) {
          return NextResponse.json({ error: "Authentication required" }, { status: 401 })
        }
      } catch (error) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
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
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
