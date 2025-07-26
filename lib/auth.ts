import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

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

// Get user by ID from MongoDB
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) }, { projection: { password_hash: 0 } })

    if (!user) return null

    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      role: user.role || "user",
      subscriptionStatus: user.subscription_status || "free",
      isEmailVerified: user.is_email_verified || false,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at || user.created_at,
    }
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

// Get user by email from MongoDB
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ email }, { projection: { password_hash: 0 } })

    if (!user) return null

    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      role: user.role || "user",
      subscriptionStatus: user.subscription_status || "free",
      isEmailVerified: user.is_email_verified || false,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at || user.created_at,
    }
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

// Check if email exists in MongoDB
export async function emailExists(email: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ email })
    return !!user
  } catch (error) {
    console.error("Error checking email exists:", error)
    return false
  }
}

// Check if username exists in MongoDB
export async function usernameExists(username: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ username })
    return !!user
  } catch (error) {
    console.error("Error checking username exists:", error)
    return false
  }
}
