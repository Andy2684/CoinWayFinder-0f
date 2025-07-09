import { type NextRequest, NextResponse } from "next/server"
import { authService } from "./lib/auth"
import { crypto } from "crypto"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Generate a nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")

  // Define comprehensive security headers
  const securityHeaders = {
    // Content Security Policy
    "Content-Security-Policy": `
      default-src 'self';
      script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://checkout.stripe.com;
      style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' blob: data: https: *.coinbase.com *.coingecko.com *.coinmarketcap.com;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://api.stripe.com https://api.coinbase.com https://api.coingecko.com https://pro-api.coinmarketcap.com wss:;
      frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `
      .replace(/\s{2,}/g, " ")
      .trim(),

    // Strict Transport Security
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

    // X-Frame-Options
    "X-Frame-Options": "DENY",

    // X-Content-Type-Options
    "X-Content-Type-Options": "nosniff",

    // X-XSS-Protection
    "X-XSS-Protection": "1; mode=block",

    // Referrer Policy
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Permissions Policy
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(self)",

    // Cross-Origin Embedder Policy
    "Cross-Origin-Embedder-Policy": "require-corp",

    // Cross-Origin Opener Policy
    "Cross-Origin-Opener-Policy": "same-origin",

    // Cross-Origin Resource Policy
    "Cross-Origin-Resource-Policy": "same-origin",
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/api/auth/signin",
    "/api/auth/signup",
    "/api/crypto/prices",
    "/api/crypto/news",
    "/api/crypto/trends",
    "/api/news",
    "/api-docs",
    "/api/health",
    "/api/test",
  ]

  // Admin routes
  const adminRoutes = ["/admin", "/api/admin"]

  // API routes that require authentication
  const protectedApiRoutes = ["/api/bots", "/api/trades", "/api/portfolio", "/api/user", "/api/subscription"]

  // Create response with security headers
  const response = NextResponse.next()

  // Add all security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add nonce to request headers for use in components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)

  // Check if route is public
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return response
  }

  // Handle admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    const adminToken = request.cookies.get("admin-token")?.value

    if (!adminToken) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Admin authentication required" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/", request.url))
    }

    const admin = await authService.verifyAdminToken(adminToken)
    if (!admin) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Invalid admin token" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Handle protected routes
  const authToken = request.cookies.get("auth-token")?.value

  if (!authToken) {
    if (protectedApiRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/", request.url))
  }

  const user = await authService.verifyAuthToken(authToken)
  if (!user) {
    if (protectedApiRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Add user info to headers for API routes
  if (pathname.startsWith("/api/")) {
    requestHeaders.set("x-user-id", user.id)
    requestHeaders.set("x-user-email", user.email)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
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
