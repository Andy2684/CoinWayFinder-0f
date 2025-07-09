import { type NextRequest, NextResponse } from "next/server"

// Simple JWT implementation without external dependencies
interface JWTPayload {
  userId: string
  email: string
  isAdmin: boolean
  exp: number
  iat: number
}

// Simple base64 URL encoding/decoding
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/")
  while (str.length % 4) {
    str += "="
  }
  return atob(str)
}

// Create JWT token
export function createToken(payload: Omit<JWTPayload, "exp" | "iat">): string {
  const now = Math.floor(Date.now() / 1000)
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + 24 * 60 * 60, // 24 hours
  }

  const header = { alg: "HS256", typ: "JWT" }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload))

  // Simple signature (in production, use proper HMAC)
  const signature = base64UrlEncode(`${encodedHeader}.${encodedPayload}.secret`)

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = JSON.parse(base64UrlDecode(parts[1])) as JWTPayload

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch (error) {
    return null
  }
}

// Get user from token
export function getUserFromToken(request: NextRequest): JWTPayload | null {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  return verifyToken(token)
}

// Check if user has admin access
export function isAdmin(user: JWTPayload | null): boolean {
  return user?.isAdmin === true
}

// Check if user has valid subscription
export function hasValidSubscription(user: JWTPayload | null): boolean {
  // In a real app, you'd check the subscription status from the database
  // For now, we'll assume all authenticated users have valid subscriptions
  return user !== null
}

// Protected routes configuration
const protectedRoutes = ["/dashboard", "/bots", "/integrations", "/profile", "/subscription"]
const adminRoutes = ["/admin"]
const publicRoutes = ["/", "/api/auth/signin", "/api/auth/signup", "/api/auth/signout"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const user = getUserFromToken(request)

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow API routes (except protected ones)
  if (pathname.startsWith("/api/")) {
    // Protected API routes
    if (
      pathname.startsWith("/api/admin/") ||
      pathname.startsWith("/api/bots/") ||
      pathname.startsWith("/api/user/") ||
      pathname.startsWith("/api/subscription/")
    ) {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      // Admin-only API routes
      if (pathname.startsWith("/api/admin/") && !isAdmin(user)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    return NextResponse.next()
  }

  // Check admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!user || !isAdmin(user)) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // Check protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Check subscription for certain routes
    if ((pathname.startsWith("/bots") || pathname.startsWith("/integrations")) && !hasValidSubscription(user)) {
      return NextResponse.redirect(new URL("/subscription", request.url))
    }

    return NextResponse.next()
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
