import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

interface JWTPayload {
  userId: string
  email: string
  isAdmin?: boolean
  subscriptionStatus?: string
  subscriptionPlan?: string
  iat?: number
  exp?: number
}

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/bots",
  "/integrations",
  "/profile",
  "/subscription",
  "/api/bots",
  "/api/trades",
  "/api/portfolio",
  "/api/user",
]

// Admin-only routes
const adminRoutes = ["/api/admin"]

// API routes that require subscription check
const subscriptionRoutes = ["/api/bots", "/api/trades", "/api/ai"]

// Routes that allow expired subscriptions (read-only)
const gracefulExpirationRoutes = [
  "/api/bots", // GET requests only
  "/api/trades", // GET requests only
  "/api/portfolio", // GET requests only
  "/api/user/profile", // GET requests only
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // Skip middleware for public routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/api/coinbase/webhook") ||
    pathname === "/" ||
    pathname === "/api/health" ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next()
  }

  // Get token from cookie or Authorization header
  const token = request.cookies.get("auth-token")?.value || request.headers.get("Authorization")?.replace("Bearer ", "")

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isSubscriptionRoute = subscriptionRoutes.some((route) => pathname.startsWith(route))
  const isGracefulRoute = gracefulExpirationRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute || isAdminRoute || isSubscriptionRoute) {
    if (!token) {
      // Redirect to login for web pages, return 401 for API routes
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      } else {
        const loginUrl = new URL("/", request.url)
        loginUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(loginUrl)
      }
    }

    try {
      // Verify JWT token
      const payload = jwt.verify(token, JWT_SECRET) as JWTPayload

      // Check admin access
      if (isAdminRoute && !payload.isAdmin) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 })
      }

      // Check subscription status for write operations
      if (isSubscriptionRoute && method !== "GET") {
        if (payload.subscriptionStatus === "expired") {
          return NextResponse.json(
            {
              error: "Your subscription has expired. Please renew to continue.",
              code: "SUBSCRIPTION_EXPIRED",
              renewUrl: "/subscription",
            },
            {
              status: 402, // Payment Required
              headers: {
                "X-Subscription-Status": "expired",
                "X-Subscription-Warning": "Subscription expired - read-only access",
              },
            },
          )
        }
      }

      // Allow graceful expiration for read operations
      if (isGracefulRoute && method === "GET" && payload.subscriptionStatus === "expired") {
        const response = NextResponse.next()
        response.headers.set("X-Subscription-Status", "expired")
        response.headers.set("X-Subscription-Warning", "Subscription expired - read-only access")
        response.headers.set("X-User-Id", payload.userId)
        response.headers.set("X-User-Email", payload.email)
        return response
      }

      // Add user info to request headers for API routes
      const response = NextResponse.next()
      response.headers.set("X-User-Id", payload.userId)
      response.headers.set("X-User-Email", payload.email)
      response.headers.set("X-Subscription-Status", payload.subscriptionStatus || "active")
      response.headers.set("X-Subscription-Plan", payload.subscriptionPlan || "free")

      if (payload.isAdmin) {
        response.headers.set("X-User-Role", "admin")
      }

      return response
    } catch (error) {
      console.error("JWT verification failed:", error)

      // Invalid token - redirect to login for web pages, return 401 for API routes
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
      } else {
        const loginUrl = new URL("/", request.url)
        loginUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(loginUrl)
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
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

// Utility functions for use in API routes
export const getUserFromRequest = (request: NextRequest): JWTPayload | null => {
  const token = request.cookies.get("auth-token")?.value || request.headers.get("Authorization")?.replace("Bearer ", "")

  if (!token) return null

  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export const requireAuth = (request: NextRequest): JWTPayload => {
  const user = getUserFromRequest(request)
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export const requireAdmin = (request: NextRequest): JWTPayload => {
  const user = requireAuth(request)
  if (!user.isAdmin) {
    throw new Error("Admin access required")
  }
  return user
}

export const checkSubscription = (user: JWTPayload, method: string): boolean => {
  // Allow read operations for expired subscriptions (graceful expiration)
  if (method === "GET" && user.subscriptionStatus === "expired") {
    return true
  }

  // Require active subscription for write operations
  return user.subscriptionStatus === "active"
}

export const createAuthToken = (payload: Omit<JWTPayload, "iat" | "exp">): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export const verifyAuthToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

// Response helpers
export const createAuthResponse = (data: any, token?: string) => {
  const response = NextResponse.json(data)

  if (token) {
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })
  }

  return response
}

export const createLogoutResponse = () => {
  const response = NextResponse.json({ success: true })
  response.cookies.delete("auth-token")
  return response
}

export const createSubscriptionExpiredResponse = () => {
  return NextResponse.json(
    {
      error: "Your subscription has expired. Your existing bots will continue running, but you cannot create new ones.",
      code: "SUBSCRIPTION_EXPIRED",
      renewUrl: "/subscription",
      gracefulExpiration: true,
    },
    {
      status: 402, // Payment Required
      headers: {
        "X-Subscription-Status": "expired",
        "X-Subscription-Warning": "Subscription expired - graceful expiration active",
      },
    },
  )
}

export default middleware
