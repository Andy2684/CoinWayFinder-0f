import { type NextRequest, NextResponse } from "next/server"
import { authService } from "./lib/auth"

// Define protected routes
const protectedRoutes = [
  "/dashboard",
  "/bots",
  "/profile",
  "/subscription",
  "/integrations",
  "/api/user",
  "/api/bots",
  "/api/trades",
  "/api/portfolio",
]

// Define admin routes
const adminRoutes = ["/admin", "/api/admin"]

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/api/auth",
  "/api/stripe/webhook",
  "/api/telegram-webhook",
  "/api/coinbase/webhook",
  "/api/subscription/webhook",
  "/api/crypto/prices",
  "/api/crypto/news",
  "/api/news",
  "/api/whales",
  "/api/v1",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const url = request.nextUrl.clone()

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
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
  if (isAdminRoute) {
    return handleAdminRoute(request)
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  if (isProtectedRoute) {
    return handleProtectedRoute(request)
  }

  return NextResponse.next()
}

async function handleProtectedRoute(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return redirectToLogin(request)
  }

  try {
    const user = await authService.verifyAuthToken(token)
    if (!user) {
      return redirectToLogin(request)
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", user.id)
    requestHeaders.set("x-user-email", user.email)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error("Auth middleware error:", error)
    return redirectToLogin(request)
  }
}

async function handleAdminRoute(request: NextRequest) {
  const adminToken = request.cookies.get("admin-token")?.value

  if (!adminToken) {
    return redirectToAdminLogin(request)
  }

  try {
    const admin = await authService.verifyAdminToken(adminToken)
    if (!admin) {
      return redirectToAdminLogin(request)
    }

    // Add admin info to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-admin-id", admin.id)
    requestHeaders.set("x-admin-role", admin.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error("Admin auth middleware error:", error)
    return redirectToAdminLogin(request)
  }
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone()

  // For API routes, return 401
  if (url.pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  // For page routes, redirect to home with auth dialog
  url.pathname = "/"
  url.searchParams.set("auth", "signin")
  url.searchParams.set("redirect", request.nextUrl.pathname)

  return NextResponse.redirect(url)
}

function redirectToAdminLogin(request: NextRequest) {
  const url = request.nextUrl.clone()

  // For API routes, return 401
  if (url.pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 })
  }

  // For page routes, redirect to home with admin auth dialog
  url.pathname = "/"
  url.searchParams.set("admin", "signin")

  return NextResponse.redirect(url)
}

// Add CORS headers for API routes
function addCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key")
  return response
}

// Handle preflight requests
export function handlePreflight(request: NextRequest) {
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 })
    return addCorsHeaders(response)
  }
  return null
}

// Rate limiting for API routes
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(request: NextRequest, limit = 100, windowMs = 60000) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const now = Date.now()
  const windowStart = now - windowMs

  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key)
    }
  }

  const current = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs }

  if (current.count >= limit && current.resetTime > now) {
    return false
  }

  current.count++
  rateLimitMap.set(ip, current)
  return true
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
