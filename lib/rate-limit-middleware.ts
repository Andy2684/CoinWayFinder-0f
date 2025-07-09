import { type NextRequest, NextResponse } from "next/server"
import { type RateLimiter, apiRateLimiter, authRateLimiter, strictRateLimiter } from "./security"

export function getRateLimiter(pathname: string): RateLimiter {
  // Auth endpoints get stricter rate limiting
  if (pathname.includes("/auth/")) {
    return authRateLimiter
  }

  // Admin endpoints get strict rate limiting
  if (pathname.includes("/admin/")) {
    return strictRateLimiter
  }

  // Default API rate limiting
  return apiRateLimiter
}

export function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from headers first
  const userId = request.headers.get("x-user-id")
  if (userId) return `user:${userId}`

  // Fall back to IP address
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown"
  return `ip:${ip}`
}

export function applyRateLimit(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl

  // Skip rate limiting for health checks and static assets
  if (pathname.includes("/health") || pathname.includes("/_next/")) {
    return null
  }

  const rateLimiter = getRateLimiter(pathname)
  const identifier = getClientIdentifier(request)

  if (!rateLimiter.isAllowed(identifier)) {
    const resetTime = rateLimiter.getResetTime(identifier)
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)

    const response = NextResponse.json(
      {
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter,
      },
      { status: 429 },
    )

    response.headers.set("Retry-After", retryAfter.toString())
    response.headers.set("X-RateLimit-Limit", rateLimiter["config"].maxRequests.toString())
    response.headers.set("X-RateLimit-Remaining", "0")
    response.headers.set("X-RateLimit-Reset", resetTime.toString())

    return response
  }

  return null
}

export function addRateLimitHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const rateLimiter = getRateLimiter(pathname)
  const identifier = getClientIdentifier(request)

  const remaining = rateLimiter.getRemainingRequests(identifier)
  const resetTime = rateLimiter.getResetTime(identifier)

  response.headers.set("X-RateLimit-Limit", rateLimiter["config"].maxRequests.toString())
  response.headers.set("X-RateLimit-Remaining", remaining.toString())
  response.headers.set("X-RateLimit-Reset", resetTime.toString())

  return response
}
