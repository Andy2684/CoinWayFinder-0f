// Browser-compatible security utilities without crypto dependency

export function generateRandomString(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

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

export function generateSecureToken(): string {
  return generateRandomString(64)
}

export function generateApiKey(): string {
  const prefix = "cwf_"
  const key = generateRandomString(40)
  return prefix + key
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/['"]/g, "") // Remove quotes
    .trim()
}

export function generateNonce(): string {
  return generateRandomString(16)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function maskSensitiveData(data: string, visibleChars = 4): string {
  if (data.length <= visibleChars * 2) {
    return "*".repeat(data.length)
  }

  const start = data.substring(0, visibleChars)
  const end = data.substring(data.length - visibleChars)
  const middle = "*".repeat(data.length - visibleChars * 2)

  return start + middle + end
}

export function generateCSRFToken(): string {
  return generateRandomString(32)
}

export function validateCSRFToken(token: string, expectedToken: string): boolean {
  return token === expectedToken
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): {
  allowed: boolean
  remaining: number
  resetTime: number
} {
  // Simple in-memory rate limiting
  const now = Date.now()
  const windowStart = Math.floor(now / windowMs) * windowMs

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 0, windowStart })
  }

  const record = rateLimitStore.get(key)!

  if (record.windowStart < windowStart) {
    record.count = 0
    record.windowStart = windowStart
  }

  record.count++

  return {
    allowed: record.count <= limit,
    remaining: Math.max(0, limit - record.count),
    resetTime: windowStart + windowMs,
  }
}

// Simple in-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; windowStart: number }>()

export function cleanupRateLimit(): void {
  const now = Date.now()
  const oneHourAgo = now - 60 * 60 * 1000

  for (const [key, record] of rateLimitStore.entries()) {
    if (record.windowStart < oneHourAgo) {
      rateLimitStore.delete(key)
    }
  }
}

// Security headers
export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
}

export function generateContentSecurityPolicy(nonce?: string): string {
  const basePolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ]

  if (nonce) {
    basePolicy[1] = `script-src 'self' 'nonce-${nonce}'`
  }

  return basePolicy.join("; ")
}
