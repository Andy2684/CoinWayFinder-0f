import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "./lib/admin"
import { authService } from "./lib/auth"

// Define protected routes
const protectedRoutes = ["/dashboard", "/bots", "/integrations", "/profile", "/subscription", "/news"]

const adminRoutes = ["/admin"]

const publicRoutes = [
  "/",
  "/api/auth",
  "/api/stripe/webhook",
  "/api/coinbase/webhook",
  "/api/telegram-webhook",
  "/api/crypto/prices",
  "/api/crypto/news",
  "/api/news",
  "/api/test-connection",
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
      const admin = await verifyAdminToken(adminToken)
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
      return NextResponse.redirect(new URL("/?auth=signin", request.url))
    }

    try {
      const user = await authService.verifyToken(authToken)
      if (!user) {
        const response = NextResponse.redirect(new URL("/?auth=signin", request.url))
        response.cookies.delete("auth-token")
        return response
      }

      // Check if user account is active
      if (!user.isActive) {
        const response = NextResponse.redirect(new URL("/?error=account-suspended", request.url))
        response.cookies.delete("auth-token")
        return response
      }

      // Add user info to headers for API routes
      const response = NextResponse.next()
      response.headers.set("x-user-id", user.id)
      response.headers.set("x-user-role", user.role || "user")

      if (user.subscription) {
        response.headers.set("x-user-subscription", JSON.stringify(user.subscription))
      }

      return response
    } catch (error) {
      console.error("Middleware auth error:", error)
      const response = NextResponse.redirect(new URL("/?auth=signin", request.url))
      response.cookies.delete("auth-token")
      return response
    }
  } else if (pathname.startsWith("/api/")) {
    // Add CORS headers for API routes
    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    // Skip public API routes
    const publicApiRoutes = ["/api/crypto/prices", "/api/crypto/news", "/api/news", "/api/test-connection"]

    const isPublicApi = publicApiRoutes.some((route) => pathname.startsWith(route))

    if (!isPublicApi) {
      // Check for API key or auth token
      const apiKey = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "")
      const authToken = request.cookies.get("auth-token")?.value

      if (!apiKey && !authToken) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      // If using API key, validate it
      if (apiKey) {
        try {
          const { apiKeyManager } = await import("./lib/api-key-manager")
          const keyData = await apiKeyManager.validateApiKey(apiKey)

          if (!keyData) {
            return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
          }

          // Check rate limits
          const rateLimitCheck = await apiKeyManager.checkRateLimit(keyData)
          if (!rateLimitCheck.allowed) {
            return NextResponse.json(
              {
                error: "Rate limit exceeded",
                resetTime: rateLimitCheck.resetTime,
              },
              { status: 429 },
            )
          }

          // Add API key info to headers
          response.headers.set("x-api-key-id", keyData.id)
          response.headers.set("x-user-id", keyData.userId)
          return response
        } catch (error) {
          console.error("API key validation error:", error)
          return NextResponse.json({ error: "API key validation failed" }, { status: 500 })
        }
      }

      // If using auth token, validate it
      if (authToken) {
        try {
          const user = await authService.verifyToken(authToken)
          if (!user || !user.isActive) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
          }

          // Add user info to headers
          response.headers.set("x-user-id", user.id)
          response.headers.set("x-user-role", user.role || "user")

          if (user.subscription) {
            response.headers.set("x-user-subscription", JSON.stringify(user.subscription))
          }

          return response
        } catch (error) {
          console.error("Token validation error:", error)
          return NextResponse.json({ error: "Token validation failed" }, { status: 500 })
        }
      }
    }

    return response
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
