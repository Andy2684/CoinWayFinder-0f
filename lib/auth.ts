import { sql } from "./database"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

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

export interface TokenPayload {
  userId: string
  email: string
}

// Generate JWT token using jsonwebtoken library
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

// Verify JWT token using jsonwebtoken library
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    return null
  }
}

// Get current user from cookies
export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    return verifyToken(token)
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
