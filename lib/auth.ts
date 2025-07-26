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

// Hash password using Node.js crypto (more compatible than bcrypt)
export async function hashPassword(password: string): Promise<string> {
  const crypto = await import("crypto")
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const crypto = await import("crypto")
  const [salt, hash] = hashedPassword.split(":")
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex")
  return hash === verifyHash
}

// Generate JWT token (simplified for Next.js compatibility)
export function generateToken(userId: string): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor((Date.now() + JWT_EXPIRES_IN) / 1000),
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))

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
export function verifyToken(token: string): { userId: string } | null {
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

    return { userId: payload.userId }
  } catch (error) {
    return null
  }
}

// Create user
export async function createUser(userData: {
  email: string
  password: string
  firstName: string
  lastName: string
  username?: string
}): Promise<User> {
  const passwordHash = await hashPassword(userData.password)
  const username = userData.username || `${userData.firstName.toLowerCase()}_${userData.lastName.toLowerCase()}`

  const [user] = await sql`
    INSERT INTO users (
      email, 
      password_hash, 
      first_name, 
      last_name, 
      username
    )
    VALUES (
      ${userData.email}, 
      ${passwordHash}, 
      ${userData.firstName}, 
      ${userData.lastName}, 
      ${username}
    )
    RETURNING 
      id, 
      email, 
      first_name as "firstName", 
      last_name as "lastName", 
      username, 
      role, 
      subscription_status as "subscriptionStatus", 
      is_email_verified as "isEmailVerified", 
      last_login as "lastLogin", 
      created_at as "createdAt", 
      updated_at as "updatedAt"
  `

  return user
}

// Authenticate user
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const [user] = await sql`
    SELECT 
      id, 
      email, 
      password_hash, 
      first_name as "firstName", 
      last_name as "lastName", 
      username, 
      role, 
      subscription_status as "subscriptionStatus", 
      is_email_verified as "isEmailVerified", 
      last_login as "lastLogin", 
      created_at as "createdAt", 
      updated_at as "updatedAt"
    FROM users 
    WHERE email = ${email}
  `

  if (!user) {
    return null
  }

  const isValidPassword = await verifyPassword(password, user.password_hash)
  if (!isValidPassword) {
    return null
  }

  // Update last login
  await sql`
    UPDATE users 
    SET last_login = CURRENT_TIMESTAMP 
    WHERE id = ${user.id}
  `

  // Remove password_hash from returned user
  const { password_hash, ...userWithoutPassword } = user
  return userWithoutPassword
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  const [user] = await sql`
    SELECT 
      id, 
      email, 
      first_name as "firstName", 
      last_name as "lastName", 
      username, 
      role, 
      subscription_status as "subscriptionStatus", 
      is_email_verified as "isEmailVerified", 
      last_login as "lastLogin", 
      created_at as "createdAt", 
      updated_at as "updatedAt"
    FROM users 
    WHERE id = ${userId}
  `

  return user || null
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await sql`
    SELECT 
      id, 
      email, 
      first_name as "firstName", 
      last_name as "lastName", 
      username, 
      role, 
      subscription_status as "subscriptionStatus", 
      is_email_verified as "isEmailVerified", 
      last_login as "lastLogin", 
      created_at as "createdAt", 
      updated_at as "updatedAt"
    FROM users 
    WHERE email = ${email}
  `

  return user || null
}

// Check if email exists
export async function emailExists(email: string): Promise<boolean> {
  const [result] = await sql`
    SELECT 1 FROM users WHERE email = ${email}
  `
  return !!result
}

// Check if username exists
export async function usernameExists(username: string): Promise<boolean> {
  const [result] = await sql`
    SELECT 1 FROM users WHERE username = ${username}
  `
  return !!result
}
