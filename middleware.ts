import { type NextRequest, NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

interface JWTPayload {
  userId: string
  email: string
  role?: string
  subscription?: { status: string; expiresAt: string }
  iat?: number
  exp?: number
}

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/api/auth/signin",
  "/api/auth/signup",
  "/api/crypto/prices",
  "/api/crypto/news",
  "/api/news",
  "/api-docs",
]

// Admin routes
const adminRoutes = ["/api/admin"]

// Protected routes that require authentication
const protectedRoutes = ["/dashboard", "/bots", "/integrations", "/profile"]

// Routes that allow expired subscriptions (read-only)
const gracefulExpirationRoutes = [
  "/api/bots", // GET requests only
  "/api/trades", // GET requests only
  "/api/portfolio", // GET requests only
  "/api/user/profile", // GET requests only
]

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

function verifyToken(token: string, secret: string): any {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [encodedHeader, encodedPayload, signature] = parts

    // Verify signature (simplified)
    const expectedSignature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`)
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
    if (signature !== expectedSignature) return null

    // Decode payload
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/")))

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch (error) {
    return null
  }
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

  // Check if route is public
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Get token from cookie or Authorization header
  const token = getTokenFromRequest(request)

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Verify token
  const payload = verifyToken(token, JWT_SECRET)
  if (!payload) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Check admin access
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
  }

  // Check subscription for protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (payload.subscription?.status !== "active" || new Date(payload.subscription?.expiresAt) < new Date()) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Subscription required" }, { status: 402 })
      }
      return NextResponse.redirect(new URL("/subscription", request.url))
    }
  }

  // Allow graceful expiration for read operations
  const isGracefulRouteFlag = gracefulExpirationRoutes.some((route) => pathname.startsWith(route))
  if (isGracefulRouteFlag && method === "GET" && payload.subscription?.status === "expired") {
    const response = NextResponse.next()
    response.headers.set("X-Subscription-Status", "expired")
    response.headers.set("X-Subscription-Warning", "Subscription expired - read-only access")
    response.headers.set("X-User-Id", payload.userId)
    response.headers.set("X-User-Email", payload.email)
    return response
  }

  // Add user info to headers for API routes
  const response = NextResponse.next()
  response.headers.set("x-user-id", payload.userId)
  response.headers.set("x-user-role", payload.role || "user")
  response.headers.set("x-subscription-status", payload.subscription?.status || "inactive")
  response.headers.set("x-subscription-plan", payload.subscription?.expiresAt || "free")

  return response
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

  return verifyToken(token, JWT_SECRET) as JWTPayload
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
  if (user.role !== "admin") {
    throw new Error("Admin access required")
  }
  return user
}

export const checkSubscription = (user: JWTPayload, method: string): boolean => {
  // Allow read operations for expired subscriptions (graceful expiration)
  if (method === "GET" && user.subscription?.status === "expired") {
    return true
  }

  // Require active subscription for write operations
  return user.subscription?.status === "active"
}

export const createAuthToken = (payload: Omit<JWTPayload, "iat" | "exp">): string => {
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  const now = Math.floor(Date.now() / 1000)
  const exp = now + 24 * 60 * 60 // 24 hours

  const tokenPayload = {
    ...payload,
    iat: now,
    exp: exp,
  }

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
  const encodedPayload = btoa(JSON.stringify(tokenPayload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")

  // Simple signature (in production, use proper HMAC)
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export const verifyAuthToken = (token: string): JWTPayload => {
  const payload = verifyToken(token, JWT_SECRET)
  if (!payload) {
    throw new Error("Invalid token")
  }
  return payload as JWTPayload
}

// Response helpers
export const createAuthResponse = (data: any, token?: string) => {
  const response = NextResponse.json(data)

  if (token) {
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
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
