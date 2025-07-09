import { type NextRequest, NextResponse } from "next/server"
import { securityMonitor, SecurityEventType } from "./security-monitor"

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  message?: string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()

  constructor(private config: RateLimitConfig) {}

  async checkLimit(request: NextRequest): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const identifier = this.getIdentifier(request)
    const now = Date.now()
    const record = this.requests.get(identifier)

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
      })
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      }
    }

    if (record.count >= this.config.maxRequests) {
      // Log rate limit exceeded event
      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.RATE_LIMIT_EXCEEDED,
        severity: "medium" as any,
        source: request.nextUrl.pathname,
        details: {
          identifier,
          requestCount: record.count,
          limit: this.config.maxRequests,
          windowMs: this.config.windowMs,
        },
        userAgent: request.headers.get("user-agent") || undefined,
        ip: this.getClientIP(request),
      })

      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      }
    }

    record.count++
    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime,
    }
  }

  private getIdentifier(request: NextRequest): string {
    const ip = this.getClientIP(request)
    const userId = request.headers.get("x-user-id")
    return userId || ip || "anonymous"
  }

  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for")
    const realIP = request.headers.get("x-real-ip")

    if (forwarded) {
      return forwarded.split(",")[0].trim()
    }

    if (realIP) {
      return realIP
    }

    return request.ip || "unknown"
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key)
      }
    }
  }
}

// Create rate limiters for different endpoints
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: "Too many API requests",
})

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: "Too many authentication attempts",
})

export const adminRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: "Too many admin requests",
})

export async function withRateLimit(
  request: NextRequest,
  rateLimiter: RateLimiter,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  const { allowed, remaining, resetTime } = await rateLimiter.checkLimit(request)

  if (!allowed) {
    const response = NextResponse.json(
      {
        error: "Rate limit exceeded",
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      },
      { status: 429 },
    )

    response.headers.set("X-RateLimit-Limit", rateLimiter["config"].maxRequests.toString())
    response.headers.set("X-RateLimit-Remaining", "0")
    response.headers.set("X-RateLimit-Reset", Math.ceil(resetTime / 1000).toString())
    response.headers.set("Retry-After", Math.ceil((resetTime - Date.now()) / 1000).toString())

    return response
  }

  const response = await handler()

  // Add rate limit headers to successful responses
  response.headers.set("X-RateLimit-Limit", rateLimiter["config"].maxRequests.toString())
  response.headers.set("X-RateLimit-Remaining", remaining.toString())
  response.headers.set("X-RateLimit-Reset", Math.ceil(resetTime / 1000).toString())

  return response
}

export function getRateLimiter(pathname: string): RateLimiter {
  // Auth endpoints get stricter rate limiting
  if (pathname.includes("/auth/")) {
    return authRateLimiter
  }

  // Admin endpoints get strict rate limiting
  if (pathname.includes("/admin/")) {
    return adminRateLimiter
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
