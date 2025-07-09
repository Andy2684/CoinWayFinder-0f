import type { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

export interface SecurityConfig {
  enableCSP: boolean
  enableHSTS: boolean
  enableXSSProtection: boolean
  enableFrameOptions: boolean
  enableContentTypeOptions: boolean
  enableReferrerPolicy: boolean
  enablePermissionsPolicy: boolean
}

export const defaultSecurityConfig: SecurityConfig = {
  enableCSP: true,
  enableHSTS: true,
  enableXSSProtection: true,
  enableFrameOptions: true,
  enableContentTypeOptions: true,
  enableReferrerPolicy: true,
  enablePermissionsPolicy: true,
}

export class SecurityHeaders {
  private config: SecurityConfig

  constructor(config: SecurityConfig = defaultSecurityConfig) {
    this.config = config
  }

  generateCSP(nonce?: string): string {
    const cspDirectives = [
      "default-src 'self'",
      `script-src 'self' ${nonce ? `'nonce-${nonce}'` : ""} 'strict-dynamic' https://js.stripe.com https://checkout.stripe.com`,
      `style-src 'self' ${nonce ? `'nonce-${nonce}'` : ""} 'unsafe-inline' https://fonts.googleapis.com`,
      "img-src 'self' blob: data: https: *.coinbase.com *.coingecko.com *.coinmarketcap.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.stripe.com https://api.coinbase.com https://api.coingecko.com https://pro-api.coinmarketcap.com wss:",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ]

    return cspDirectives.join("; ")
  }

  getSecurityHeaders(nonce?: string): Record<string, string> {
    const headers: Record<string, string> = {}

    if (this.config.enableCSP) {
      headers["Content-Security-Policy"] = this.generateCSP(nonce)
    }

    if (this.config.enableHSTS) {
      headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    }

    if (this.config.enableXSSProtection) {
      headers["X-XSS-Protection"] = "1; mode=block"
    }

    if (this.config.enableFrameOptions) {
      headers["X-Frame-Options"] = "DENY"
    }

    if (this.config.enableContentTypeOptions) {
      headers["X-Content-Type-Options"] = "nosniff"
    }

    if (this.config.enableReferrerPolicy) {
      headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    }

    if (this.config.enablePermissionsPolicy) {
      headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=(self)"
    }

    // Additional security headers
    headers["Cross-Origin-Embedder-Policy"] = "require-corp"
    headers["Cross-Origin-Opener-Policy"] = "same-origin"
    headers["Cross-Origin-Resource-Policy"] = "same-origin"

    return headers
  }

  applyToResponse(response: NextResponse, nonce?: string): NextResponse {
    const securityHeaders = this.getSecurityHeaders(nonce)

    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }
}

export const securityHeaders = new SecurityHeaders()

// Rate limiting utilities
export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()

  constructor(private config: RateLimitConfig) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.requests.get(identifier)

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
      })
      return true
    }

    if (record.count >= this.config.maxRequests) {
      return false
    }

    record.count++
    return true
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier)
    if (!record || Date.now() > record.resetTime) {
      return this.config.maxRequests
    }
    return Math.max(0, this.config.maxRequests - record.count)
  }

  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier)
    if (!record || Date.now() > record.resetTime) {
      return Date.now() + this.config.windowMs
    }
    return record.resetTime
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
})

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
})

export const strictRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
})

// Security validation utilities
export function validateSecurityHeaders(request: NextRequest): boolean {
  const requiredHeaders = [
    "Content-Security-Policy",
    "Strict-Transport-Security",
    "X-Frame-Options",
    "X-Content-Type-Options",
    "X-XSS-Protection",
  ]

  return requiredHeaders.every((header) => request.headers.has(header.toLowerCase()))
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim()
}

export function validateOrigin(request: NextRequest, allowedOrigins: string[]): boolean {
  const origin = request.headers.get("origin")
  if (!origin) return true // Allow requests without origin (same-origin)

  return allowedOrigins.includes(origin)
}

export async function getNonce(): Promise<string> {
  const headersList = await headers()
  return headersList.get("x-nonce") || ""
}
