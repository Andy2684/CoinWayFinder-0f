// Simple hash function for demonstration purposes
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

// Generate random string
export function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

// Security headers
export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
}

// Rate limiting
const rateLimitMap = new Map()

export function rateLimit(identifier: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now()
  const windowStart = now - windowMs

  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, [])
  }

  const requests = rateLimitMap.get(identifier)

  // Remove old requests outside the window
  const validRequests = requests.filter((timestamp: number) => timestamp > windowStart)

  if (validRequests.length >= limit) {
    return false // Rate limit exceeded
  }

  validRequests.push(now)
  rateLimitMap.set(identifier, validRequests)

  return true // Request allowed
}

// Input validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

// Sanitize input
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .trim()
    .substring(0, 1000) // Limit length
}

// CSRF token generation
export function generateCSRFToken(): string {
  return generateRandomString(32)
}

// Verify CSRF token
export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  // Simple verification - in production, use proper CSRF protection
  return token === sessionToken
}
