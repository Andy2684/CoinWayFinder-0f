import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

interface JWTPayload {
  userId: string
  email: string
  isAdmin?: boolean
  subscription?: string
  subscriptionExpiry?: string
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
  "/api/user",
  "/api/subscription",
]

// Admin-only routes
const adminRoutes = ["/api/admin"]

// Public API routes that don't require authentication
const publicApiRoutes = [
  "/api/auth/signin",
  "/api/auth/signup",
  "/api/auth/signout",
  "/api/crypto/prices",
  "/api/crypto/news",
  "/api/crypto/trends",
  "/api/crypto/whales",
  "/api/news",
  "/api/whales",
  "/api/v1",
]

// Routes that allow expired subscriptions (read-only)
const gracefulExpirationRoutes = [
  "/api/bots", // GET requests only
  "/api/trades", // GET requests only
  "/api/portfolio", // GET requests only
  "/api/user/profile", // GET requests only
]

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route))
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some((route) => pathname.startsWith(route))
}

function isPublicApiRoute(pathname: string): boolean {
  return publicApiRoutes.some((route) => pathname.startsWith(route))
}

function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  // Try to get token from cookie
  const tokenCookie = request.cookies.get("auth-token")
  if (tokenCookie) {
    return tokenCookie.value
  }

  return null
}

function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

function isSubscriptionExpired(subscriptionExpiry?: string): boolean {
  if (!subscriptionExpiry) return false
  return new Date(subscriptionExpiry) < new Date()
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  // Allow public API routes
  if (isPublicApiRoute(pathname)) {
    return NextResponse.next()
  }

  // Check if route requires authentication
  const isProtectedRouteFlag = isProtectedRoute(pathname)
  const isAdminRouteFlag = isAdminRoute(pathname)
  const isSubscriptionRouteFlag =
    pathname.startsWith("/api/bots") || pathname.startsWith("/api/trades") || pathname.startsWith("/api/ai")
  const isGracefulRouteFlag = gracefulExpirationRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRouteFlag || isAdminRouteFlag || isSubscriptionRouteFlag) {
    const token = getTokenFromRequest(request)

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
      if (isAdminRouteFlag && !payload.isAdmin) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 })
      }

      // Check subscription status for write operations
      if (isSubscriptionRouteFlag && method !== "GET") {
        if (payload.subscription === "expired") {
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
      if (isGracefulRouteFlag && method === "GET" && payload.subscription === "expired") {
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
      response.headers.set("X-Subscription-Status", payload.subscription || "active")
      response.headers.set("X-Subscription-Plan", payload.subscriptionExpiry || "free")

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
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
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
  if (method === "GET" && user.subscription === "expired") {
    return true
  }

  // Require active subscription for write operations
  return user.subscription === "active"
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
