import type { NextRequest, NextResponse } from "next/server"

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

// Simple hash function to replace crypto dependency
export function simpleHash(input: string): string {
  let hash = 0
  if (input.length === 0) return hash.toString()

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36)
}

// Generate random string without crypto
export function generateRandomString(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate nonce for CSP
export async function getNonce(): Promise<string> {
  return generateRandomString(16)
}

// Additional security utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

// Rate limiting for specific endpoints
const rateLimitMap = new Map<string, number[]>()

export function rateLimit(identifier: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now()
  const windowStart = now - windowMs

  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, [])
  }

  const requests = rateLimitMap.get(identifier)!

  // Remove old requests outside the window
  const validRequests = requests.filter((timestamp: number) => timestamp > windowStart)

  if (validRequests.length >= limit) {
    return false // Rate limit exceeded
  }

  validRequests.push(now)
  rateLimitMap.set(identifier, validRequests)

  return true // Request allowed
}

// CSRF token generation and validation
export function generateCSRFToken(): string {
  return generateRandomString(32)
}

export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  // Simple verification - in production, use proper CSRF protection
  return token === sessionToken
}

// IP address utilities
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return "unknown"
}

// Security event logging
export interface SecurityEvent {
  type: string
  severity: "low" | "medium" | "high" | "critical"
  message: string
  ip?: string
  userAgent?: string
  timestamp: Date
  metadata?: Record<string, any>
}

const securityEvents: SecurityEvent[] = []

export function logSecurityEvent(event: Omit<SecurityEvent, "timestamp">): void {
  securityEvents.push({
    ...event,
    timestamp: new Date(),
  })

  // Keep only last 1000 events
  if (securityEvents.length > 1000) {
    securityEvents.splice(0, securityEvents.length - 1000)
  }
}

export function getSecurityEvents(limit = 100): SecurityEvent[] {
  return securityEvents.slice(-limit).reverse()
}

// Content Security Policy nonce management
const nonceStore = new Map<string, { nonce: string; expires: number }>()

export function createNonce(sessionId?: string): string {
  const nonce = generateRandomString(16)
  const expires = Date.now() + 60000 // 1 minute expiry

  if (sessionId) {
    nonceStore.set(sessionId, { nonce, expires })
  }

  return nonce
}

export function validateNonce(nonce: string, sessionId?: string): boolean {
  if (!sessionId) return true // Allow if no session tracking

  const stored = nonceStore.get(sessionId)
  if (!stored) return false

  if (Date.now() > stored.expires) {
    nonceStore.delete(sessionId)
    return false
  }

  return stored.nonce === nonce
}

// Clean up expired nonces
setInterval(() => {
  const now = Date.now()
  for (const [sessionId, data] of nonceStore.entries()) {
    if (now > data.expires) {
      nonceStore.delete(sessionId)
    }
  }
}, 60000) // Clean up every minute
