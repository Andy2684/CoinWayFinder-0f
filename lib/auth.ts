import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { database } from "./database"
import crypto from "crypto"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const JWT_EXPIRES_IN = "7d"

export interface UserSession {
  id: string
  email: string
  name: string
  isAdmin?: boolean
}

export interface AuthResult {
  success: boolean
  user?: UserSession
  token?: string
  message?: string
}

class AuthManager {
  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  private comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  private generateToken(user: UserSession): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin || false,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    )
  }

  private verifyToken(token: string): UserSession | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      return {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        isAdmin: decoded.isAdmin || false,
      }
    } catch (error) {
      return null
    }
  }

  async signUp(email: string, password: string, name: string): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await database.getUserByEmail(email)
      if (existingUser) {
        return {
          success: false,
          message: "User already exists with this email",
        }
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password)

      // Create user
      const userId = crypto.randomUUID()
      const user = await database.createUser({
        id: userId,
        email,
        name,
        password: hashedPassword,
        createdAt: new Date(),
        isActive: true,
        emailVerified: false,
      })

      // Create default user settings
      await database.createUserSettings({
        userId,
        subscription: {
          plan: "free",
          status: "active",
        },
        trial: {
          hasUsed: false,
          isActive: false,
        },
        notifications: {
          email: true,
          telegram: false,
          push: false,
        },
        preferences: {
          theme: "light",
          currency: "USD",
          timezone: "UTC",
        },
      })

      const userSession: UserSession = {
        id: user.id,
        email: user.email,
        name: user.name,
      }

      const token = this.generateToken(userSession)
      await this.setAuthCookie(token)

      return {
        success: true,
        user: userSession,
        token,
        message: "Account created successfully",
      }
    } catch (error) {
      console.error("Sign up error:", error)
      return {
        success: false,
        message: "Failed to create account",
      }
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      // Find user
      const user = await database.getUserByEmail(email)
      if (!user) {
        return {
          success: false,
          message: "Invalid email or password",
        }
      }

      // Check password
      const isValidPassword = await this.comparePassword(password, user.password)
      if (!isValidPassword) {
        return {
          success: false,
          message: "Invalid email or password",
        }
      }

      // Update last login
      await database.updateUser(user.id, {
        lastLoginAt: new Date(),
      })

      const userSession: UserSession = {
        id: user.id,
        email: user.email,
        name: user.name,
      }

      const token = this.generateToken(userSession)
      await this.setAuthCookie(token)

      return {
        success: true,
        user: userSession,
        token,
        message: "Signed in successfully",
      }
    } catch (error) {
      console.error("Sign in error:", error)
      return {
        success: false,
        message: "Failed to sign in",
      }
    }
  }

  async signOut(): Promise<void> {
    await this.clearAuthCookie()
  }

  async getCurrentUser(token?: string): Promise<UserSession | null> {
    try {
      let authToken = token

      if (!authToken) {
        const cookieStore = await cookies()
        authToken = cookieStore.get("auth-token")?.value
      }

      if (!authToken) {
        return null
      }

      const user = this.verifyToken(authToken)
      if (!user) {
        return null
      }

      // Verify user still exists and is active
      const dbUser = await database.getUserById(user.id)
      if (!dbUser || !dbUser.isActive) {
        return null
      }

      return user
    } catch (error) {
      console.error("Get current user error:", error)
      return null
    }
  }

  async requireAuth(): Promise<UserSession> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error("Authentication required")
    }
    return user
  }

  private async setAuthCookie(token: string): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })
  }

  private async clearAuthCookie(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete("auth-token")
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      const user = await database.getUserById(userId)
      if (!user) {
        return {
          success: false,
          message: "User not found",
        }
      }

      const isValidPassword = await this.comparePassword(currentPassword, user.password)
      if (!isValidPassword) {
        return {
          success: false,
          message: "Current password is incorrect",
        }
      }

      const hashedNewPassword = await this.hashPassword(newPassword)
      await database.updateUser(userId, {
        password: hashedNewPassword,
      })

      return {
        success: true,
        message: "Password changed successfully",
      }
    } catch (error) {
      console.error("Change password error:", error)
      return {
        success: false,
        message: "Failed to change password",
      }
    }
  }

  async updateProfile(userId: string, updates: { name?: string; email?: string }): Promise<AuthResult> {
    try {
      // If email is being updated, check if it's already taken
      if (updates.email) {
        const existingUser = await database.getUserByEmail(updates.email)
        if (existingUser && existingUser.id !== userId) {
          return {
            success: false,
            message: "Email is already taken",
          }
        }
      }

      await database.updateUser(userId, updates)

      const updatedUser = await database.getUserById(userId)
      if (!updatedUser) {
        return {
          success: false,
          message: "Failed to update profile",
        }
      }

      const userSession: UserSession = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      }

      // Update token with new info
      const token = this.generateToken(userSession)
      await this.setAuthCookie(token)

      return {
        success: true,
        user: userSession,
        token,
        message: "Profile updated successfully",
      }
    } catch (error) {
      console.error("Update profile error:", error)
      return {
        success: false,
        message: "Failed to update profile",
      }
    }
  }
}

export const authManager = new AuthManager()
