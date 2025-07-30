import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "./mongodb"
import type { User } from "@/types"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface AuthUser {
  id: string
  email: string
  username?: string
  role: "user" | "admin"
  created_at: Date
  last_login?: Date
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(userData: {
  email: string
  password: string
  username?: string
}): Promise<AuthUser> {
  try {
    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email: userData.email })
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password)

    // Create user document
    const userDoc = {
      email: userData.email,
      password: hashedPassword,
      username: userData.username,
      role: "user" as const,
      created_at: new Date(),
      updated_at: new Date(),
      email_verified: false,
      profile: {
        first_name: "",
        last_name: "",
        bio: "",
        avatar_url: "",
        timezone: "UTC",
        language: "en",
      },
      settings: {
        notifications: {
          email: true,
          push: true,
          trading_alerts: true,
          news_alerts: false,
        },
        trading: {
          default_risk_level: "medium",
          auto_trading: false,
          max_daily_trades: 10,
        },
        privacy: {
          profile_public: false,
          show_portfolio: false,
        },
      },
    }

    const result = await db.collection("users").insertOne(userDoc)

    return {
      id: result.insertedId.toString(),
      email: userData.email,
      username: userData.username,
      role: "user",
      created_at: userDoc.created_at,
    }
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    const { db } = await connectToDatabase()

    const user = await db.collection("users").findOne({ email })
    if (!user) {
      return null
    }

    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return null
    }

    // Update last login
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          last_login: new Date(),
          updated_at: new Date(),
        },
      },
    )

    return {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role || "user",
      created_at: user.created_at,
      last_login: new Date(),
    }
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()
    const { ObjectId } = require("mongodb")

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
    if (!user) {
      return null
    }

    return {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role || "user",
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login,
      email_verified: user.email_verified || false,
      profile: user.profile || {},
      settings: user.settings || {},
    }
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()
    const { ObjectId } = require("mongodb")

    const updateDoc = {
      ...updates,
      updated_at: new Date(),
    }

    const result = await db
      .collection("users")
      .findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: updateDoc }, { returnDocument: "after" })

    if (!result) {
      return null
    }

    return {
      id: result._id.toString(),
      email: result.email,
      username: result.username,
      role: result.role || "user",
      created_at: result.created_at,
      updated_at: result.updated_at,
      last_login: result.last_login,
      email_verified: result.email_verified || false,
      profile: result.profile || {},
      settings: result.settings || {},
    }
  } catch (error) {
    console.error("Error updating user:", error)
    return null
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
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
    valid: errors.length === 0,
    errors,
  }
}
