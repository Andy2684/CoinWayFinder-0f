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
  iat?: number
  exp?: number
}

// Generate JWT token with proper error handling
export function generateToken(payload: TokenPayload): string {
  try {
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
        issuer: "coinwayfinder",
        audience: "coinwayfinder-users",
      },
    )
  } catch (error) {
    console.error("Error generating JWT token:", error)
    throw new Error("Failed to generate authentication token")
  }
}

// Verify JWT token with comprehensive error handling
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "coinwayfinder",
      audience: "coinwayfinder-users",
    }) as TokenPayload

    // Validate required fields
    if (!decoded.userId || !decoded.email) {
      console.error("Invalid token payload: missing required fields")
      return null
    }

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log("Token expired")
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error("Invalid token:", error.message)
    } else {
      console.error("Token verification error:", error)
    }
    return null
  }
}

// Get current user from cookies with error handling
export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    return verifyToken(token)
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Get user by ID from MongoDB with comprehensive error handling
export async function getUserById(userId: string): Promise<User | null> {
  try {
    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      console.error("Invalid user ID format:", userId)
      return null
    }

    const { db } = await connectToDatabase()
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) }, { projection: { password_hash: 0 } })

    if (!user) {
      console.log("User not found:", userId)
      return null
    }

    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      role: user.role || "user",
      subscriptionStatus: user.subscription_status || "free",
      isEmailVerified: user.is_email_verified || false,
      lastLogin: user.last_login?.toISOString(),
      createdAt: user.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: user.updated_at?.toISOString() || user.created_at?.toISOString() || new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

// Get user by email with error handling
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    if (!email || typeof email !== "string") {
      console.error("Invalid email provided")
      return null
    }

    const { db } = await connectToDatabase()
    const user = await db
      .collection("users")
      .findOne({ email: email.toLowerCase().trim() }, { projection: { password_hash: 0 } })

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
      lastLogin: user.last_login?.toISOString(),
      createdAt: user.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: user.updated_at?.toISOString() || user.created_at?.toISOString() || new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

// Check if email exists with error handling
export async function emailExists(email: string): Promise<boolean> {
  try {
    if (!email || typeof email !== "string") {
      return false
    }

    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ email: email.toLowerCase().trim() }, { projection: { _id: 1 } })
    return !!user
  } catch (error) {
    console.error("Error checking email exists:", error)
    return false
  }
}

// Check if username exists with error handling
export async function usernameExists(username: string): Promise<boolean> {
  try {
    if (!username || typeof username !== "string") {
      return false
    }

    const { db } = await connectToDatabase()
    const user = await db
      .collection("users")
      .findOne({ username: username.toLowerCase().trim() }, { projection: { _id: 1 } })
    return !!user
  } catch (error) {
    console.error("Error checking username exists:", error)
    return false
  }
}

// Update user profile with validation
export async function updateUserProfile(
  userId: string,
  updates: {
    firstName?: string
    lastName?: string
    username?: string
    email?: string
  },
): Promise<User | null> {
  try {
    if (!ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID format")
    }

    const { db } = await connectToDatabase()

    // Prepare update object
    const updateData: any = {
      updated_at: new Date(),
    }

    if (updates.firstName !== undefined) {
      updateData.first_name = updates.firstName.trim()
    }
    if (updates.lastName !== undefined) {
      updateData.last_name = updates.lastName.trim()
    }
    if (updates.username !== undefined) {
      updateData.username = updates.username.toLowerCase().trim()
    }
    if (updates.email !== undefined) {
      updateData.email = updates.email.toLowerCase().trim()
    }

    // Check for conflicts if email or username is being updated
    if (updates.email || updates.username) {
      const conflicts = await db.collection("users").findOne({
        $and: [
          { _id: { $ne: new ObjectId(userId) } },
          {
            $or: [
              ...(updates.email ? [{ email: updates.email.toLowerCase().trim() }] : []),
              ...(updates.username ? [{ username: updates.username.toLowerCase().trim() }] : []),
            ],
          },
        ],
      })

      if (conflicts) {
        if (conflicts.email === updates.email?.toLowerCase().trim()) {
          throw new Error("Email already in use")
        }
        if (conflicts.username === updates.username?.toLowerCase().trim()) {
          throw new Error("Username already taken")
        }
      }
    }

    const result = await db
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updateData },
        { returnDocument: "after", projection: { password_hash: 0 } },
      )

    if (!result) {
      throw new Error("User not found or update failed")
    }

    return {
      id: result._id.toString(),
      email: result.email,
      firstName: result.first_name,
      lastName: result.last_name,
      username: result.username,
      role: result.role || "user",
      subscriptionStatus: result.subscription_status || "free",
      isEmailVerified: result.is_email_verified || false,
      lastLogin: result.last_login?.toISOString(),
      createdAt: result.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: result.updated_at?.toISOString() || new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}
