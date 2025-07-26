import { sql } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
const JWT_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  username?: string
  role: "user" | "admin"
  subscriptionStatus: "free" | "starter" | "pro" | "enterprise"
  isEmailVerified: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface AuthUser extends User {
  token: string
}

// Simple JWT implementation for Next.js compatibility
function base64UrlEncode(str: string): string {
  return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function base64UrlDecode(str: string): string {
  str += new Array(5 - (str.length % 4)).join("=")
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
}

// Generate JWT token (simplified for Next.js compatibility)
export function generateToken(payload: { userId: string; email: string }): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  const tokenPayload = {
    userId: payload.userId,
    email: payload.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor((Date.now() + JWT_EXPIRES_IN) / 1000),
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload))

  const crypto = require("crypto")
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

// Verify JWT token
export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split(".")

    if (!encodedHeader || !encodedPayload || !signature) {
      return null
    }

    // Verify signature
    const crypto = require("crypto")
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")

    if (signature !== expectedSignature) {
      return null
    }

    // Decode payload
    const payload = JSON.parse(base64UrlDecode(encodedPayload))

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return { userId: payload.userId, email: payload.email }
  } catch (error) {
    return null
  }
}

// Get user by ID with safe column access
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const [user] = await sql`
      SELECT 
        id, 
        email, 
        first_name as "firstName", 
        last_name as "lastName", 
        username, 
        COALESCE(role, 'user') as "role", 
        COALESCE(subscription_status, 'free') as "subscriptionStatus", 
        COALESCE(is_email_verified, false) as "isEmailVerified", 
        last_login as "lastLogin", 
        created_at as "createdAt", 
        COALESCE(updated_at, created_at) as "updatedAt"
      FROM users 
      WHERE id = ${userId}
    `

    return user || null
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

// Get user by email with safe column access
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const [user] = await sql`
      SELECT 
        id, 
        email, 
        first_name as "firstName", 
        last_name as "lastName", 
        username, 
        COALESCE(role, 'user') as "role", 
        COALESCE(subscription_status, 'free') as "subscriptionStatus", 
        COALESCE(is_email_verified, false) as "isEmailVerified", 
        last_login as "lastLogin", 
        created_at as "createdAt", 
        COALESCE(updated_at, created_at) as "updatedAt"
      FROM users 
      WHERE email = ${email}
    `

    return user || null
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

// Check if email exists
export async function emailExists(email: string): Promise<boolean> {
  try {
    const [result] = await sql`
      SELECT 1 FROM users WHERE email = ${email}
    `
    return !!result
  } catch (error) {
    console.error("Error checking email exists:", error)
    return false
  }
}

// Check if username exists
export async function usernameExists(username: string): Promise<boolean> {
  try {
    const [result] = await sql`
      SELECT 1 FROM users WHERE username = ${username}
    `
    return !!result
  } catch (error) {
    console.error("Error checking username exists:", error)
    return false
  }
}
