import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "ioredis"
import { securityMonitor, SecurityEventType, SecuritySeverity } from "./security-monitor"

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (request: NextRequest) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  message?: string
}

interface RateLimitInfo {
  totalHits: number
  totalHitsPerUser?: number
  resetTime: Date
  remaining: number
  limit: number
}

class RateLimiter {
  private redis: Redis | null = null
  private memoryStore: Map<string, { count: number; resetTime: number }> = new Map()

  constructor() {
    this.initializeRedis()
    this.startCleanupInterval()
  }

  private async initializeRedis() {
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL)
        console.log("✅ Rate Limiter: Redis connected")
      } catch (error) {
        console.error("❌ Rate Limiter: Redis connection failed:", error)
      }
    } else {
      console.warn("⚠️ Rate Limiter: Using memory storage (not recommended for production)")
    }
  }

  private startCleanupInterval() {
    // Clean up expired entries every 5 minutes
    setInterval(
      () => {
        this.cleanupExpiredEntries()
      },
      5 * 60 * 1000,
    )
  }

  private cleanupExpiredEntries() {
    const now = Date.now()
    for (const [key, value] of this.memoryStore.entries()) {
      if (value.resetTime <= now) {
        this.memoryStore.delete(key)
      }
    }
  }

  async checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitInfo> {
    const now = Date.now()
    const windowStart = now - config.windowMs
    const resetTime = new Date(now + config.windowMs)

    let totalHits = 0

    if (this.redis) {
      // Use Redis for distributed rate limiting
      try {
        const pipeline = this.redis.pipeline()

        // Remove expired entries
        pipeline.zremrangebyscore(key, 0, windowStart)

        // Add current request
        pipeline.zadd(key, now, `${now}-${Math.random()}`)

        // Count requests in window
        pipeline.zcard(key)

        // Set expiration
        pipeline.expire(key, Math.ceil(config.windowMs / 1000))

        const results = await pipeline.exec()
        totalHits = (results?.[2]?.[1] as number) || 0
      } catch (error) {
        console.error("❌ Redis rate limit check failed:", error)
        // Fall back to memory storage
        return this.checkMemoryRateLimit(key, config, now, resetTime)
      }
    } else {
      // Use memory storage
      return this.checkMemoryRateLimit(key, config, now, resetTime)
    }

    const remaining = Math.max(0, config.maxRequests - totalHits)
    const isLimited = totalHits > config.maxRequests

    // Log security event if rate limited
    if (isLimited) {
      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.RATE_LIMIT_EXCEEDED,
        severity: SecuritySeverity.MEDIUM,
        source: "rate-limiter",
        details: {
          key,
          totalHits,
          limit: config.maxRequests,
          windowMs: config.windowMs,
        },
      })
    }

    return {
      totalHits,
      resetTime,
      remaining,
      limit: config.maxRequests,
    }
  }

  private checkMemoryRateLimit(key: string, config: RateLimitConfig, now: number, resetTime: Date): RateLimitInfo {
    const entry = this.memoryStore.get(key)

    if (!entry || entry.resetTime <= now) {
      // Create new entry
      this.memoryStore.set(key, { count: 1, resetTime: now + config.windowMs })
      return {
        totalHits: 1,
        resetTime,
        remaining: config.maxRequests - 1,
        limit: config.maxRequests,
      }
    } else {
      // Update existing entry
      entry.count++
      this.memoryStore.set(key, entry)

      return {
        totalHits: entry.count,
        resetTime: new Date(entry.resetTime),
        remaining: Math.max(0, config.maxRequests - entry.count),
        limit: config.maxRequests,
      }
    }
  }

  createMiddleware(config: RateLimitConfig) {
    return async (request: NextRequest): Promise<NextResponse | null> => {
      try {
        // Generate rate limit key
        const key = config.keyGenerator ? config.keyGenerator(request) : this.defaultKeyGenerator(request)

        // Check rate limit
        const rateLimitInfo = await this.checkRateLimit(`rate_limit:${key}`, config)

        // Add rate limit headers to response
        const headers = new Headers()
        headers.set("X-RateLimit-Limit", config.maxRequests.toString())
        headers.set("X-RateLimit-Remaining", rateLimitInfo.remaining.toString())
        headers.set("X-RateLimit-Reset", rateLimitInfo.resetTime.getTime().toString())
        headers.set("X-RateLimit-Window", config.windowMs.toString())

        // Check if rate limited
        if (rateLimitInfo.totalHits > config.maxRequests) {
          // Log additional security event for excessive rate limiting
          if (rateLimitInfo.totalHits > config.maxRequests * 2) {
            await securityMonitor.logSecurityEvent({
              type: SecurityEventType.API_ABUSE,
              severity: SecuritySeverity.HIGH,
              source: request.nextUrl.pathname,
              ip: this.getClientIP(request),
              userAgent: request.headers.get("user-agent") || undefined,
              details: {
                key,
                totalHits: rateLimitInfo.totalHits,
                limit: config.maxRequests,
                excessiveUsage: true,
              },
            })
          }

          return new NextResponse(
            JSON.stringify({
              error: "Rate limit exceeded",
              message: config.message || "Too many requests, please try again later",
              retryAfter: Math.ceil(config.windowMs / 1000),
              limit: config.maxRequests,
              remaining: 0,
              resetTime: rateLimitInfo.resetTime.toISOString(),
            }),
            {
              status: 429,
              headers: {
                ...Object.fromEntries(headers.entries()),
                "Content-Type": "application/json",
                "Retry-After": Math.ceil(config.windowMs / 1000).toString(),
              },
            },
          )
        }

        // Create response with rate limit headers
        const response = NextResponse.next()
        headers.forEach((value, key) => {
          response.headers.set(key, value)
        })

        return response
      } catch (error) {
        console.error("❌ Rate limit middleware error:", error)

        // Log security event for middleware failure
        await securityMonitor.logSecurityEvent({
          type: SecurityEventType.API_ABUSE,
          severity: SecuritySeverity.MEDIUM,
          source: "rate-limit-middleware",
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
            path: request.nextUrl.pathname,
          },
        })

        // Allow request to continue on error
        return NextResponse.next()
      }
    }
  }

  private defaultKeyGenerator(request: NextRequest): string {
    const ip = this.getClientIP(request)
    const userAgent = request.headers.get("user-agent") || "unknown"
    const path = request.nextUrl.pathname

    // Create a composite key for better rate limiting
    return `${ip}:${path}:${Buffer.from(userAgent).toString("base64").slice(0, 10)}`
  }

  private getClientIP(request: NextRequest): string {
    // Try various headers to get the real client IP
    const forwarded = request.headers.get("x-forwarded-for")
    const realIP = request.headers.get("x-real-ip")
    const cfConnectingIP = request.headers.get("cf-connecting-ip")

    if (cfConnectingIP) return cfConnectingIP
    if (realIP) return realIP
    if (forwarded) return forwarded.split(",")[0].trim()

    return "unknown"
  }
}

// Create singleton instance
export const rateLimiter = new RateLimiter()

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // General API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: "Too many API requests, please try again later",
  },

  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: "Too many authentication attempts, please try again later",
  },

  // Admin endpoints
  admin: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: "Too many admin requests, please try again later",
  },

  // Strict rate limiting for sensitive operations
  strict: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3,
    message: "Rate limit exceeded for sensitive operation",
  },

  // Public endpoints (more lenient)
  public: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: "Too many requests, please slow down",
  },
} as const

// Export middleware functions
export const apiRateLimit = rateLimiter.createMiddleware(rateLimitConfigs.api)
export const authRateLimit = rateLimiter.createMiddleware(rateLimitConfigs.auth)
export const adminRateLimit = rateLimiter.createMiddleware(rateLimitConfigs.admin)
export const strictRateLimit = rateLimiter.createMiddleware(rateLimitConfigs.strict)
export const publicRateLimit = rateLimiter.createMiddleware(rateLimitConfigs.public)
