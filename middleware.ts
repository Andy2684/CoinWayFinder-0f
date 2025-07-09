import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "./lib/auth"
import { adminManager } from "./lib/admin"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/signin") ||
    pathname.startsWith("/api/auth/signup") ||
    pathname.startsWith("/api/admin/signin") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/api/coinbase/webhook") ||
    pathname.startsWith("/api/telegram-webhook") ||
    pathname.includes(".") ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    try {
      const admin = await adminManager.getCurrentAdmin()
      if (!admin) {
        return NextResponse.redirect(new URL("/?admin=true", request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/?admin=true", request.url))
    }
  }

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/bots", "/integrations", "/profile", "/subscription", "/news"]

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    try {
      const user = await AuthService.getCurrentUser()
      if (!user) {
        return NextResponse.redirect(new URL("/?auth=true", request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/?auth=true", request.url))
    }
  }

  // API routes protection
  if (pathname.startsWith("/api/")) {
    // Admin API routes
    if (pathname.startsWith("/api/admin/") && !pathname.startsWith("/api/admin/signin")) {
      try {
        const admin = await adminManager.getCurrentAdmin()
        if (!admin) {
          return NextResponse.json({ error: "Admin authentication required" }, { status: 401 })
        }
      } catch (error) {
        return NextResponse.json({ error: "Admin authentication failed" }, { status: 401 })
      }
    }

    // User API routes that require authentication
    const protectedAPIRoutes = [
      "/api/bots",
      "/api/portfolio",
      "/api/user",
      "/api/subscription",
      "/api/integrations",
      "/api/trades",
    ]

    if (protectedAPIRoutes.some((route) => pathname.startsWith(route))) {
      try {
        // Check for API key first
        const apiKey = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "")

        if (apiKey) {
          // Validate API key (simplified check)
          // In a real implementation, you'd validate against your database
          if (!apiKey.startsWith("cwf_")) {
            return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
          }
        } else {
          // Check session authentication
          const user = await AuthService.getCurrentUser()
          if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 })
          }
        }
      } catch (error) {
        return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
      }
    }
  }

  // Add security headers
  const response = NextResponse.next()

  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  return response
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
