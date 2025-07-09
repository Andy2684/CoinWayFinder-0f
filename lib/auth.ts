import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { database } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export interface UserSession {
  userId: string
  email: string
  username: string
  token: string
  expiresAt: number
}

export interface AuthResult {
  success: boolean
  message: string
  user?: UserSession
}

export class AuthService {
  private static userSessions = new Map<string, UserSession>()

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateToken(user: { id: string; email: string; username: string }): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )
  }

  static verifyToken(token: string): UserSession | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      return {
        userId: decoded.userId,
        email: decoded.email,
        username: decoded.username,
        token,
        expiresAt: decoded.exp * 1000,
      }
    } catch (error) {
      return null
    }
  }

  static async setAuthCookie(user: { id: string; email: string; username: string }): Promise<void> {
    const token = this.generateToken(user)
    const cookieStore = await cookies()

    // Store session
    const session: UserSession = {
      userId: user.id,
      email: user.email,
      username: user.username,
      token,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    }

    this.userSessions.set(token, session)

    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })
  }

  static async clearAuthCookie(): Promise<void> {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (token) {
      this.userSessions.delete(token)
    }

    cookieStore.delete("auth-token")
  }

  static async getCurrentUser(): Promise<UserSession | null> {
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get("auth-token")?.value

      if (!token) {
        return null
      }

      // Check session store first
      const session = this.userSessions.get(token)
      if (session && session.expiresAt > Date.now()) {
        return session
      }

      // Verify token
      const userSession = this.verifyToken(token)
      if (!userSession) {
        return null
      }

      return userSession
    } catch (error) {
      return null
    }
  }

  static async requireAuth(): Promise<UserSession> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error("Authentication required")
    }
    return user
  }

  static async signUp(email: string, username: string, password: string): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await database.getUserByEmail(email)
      if (existingUser) {
        return { success: false, message: "User already exists with this email" }
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password)

      // Create user
      const user = await database.createUser({
        email,
        username,
        password: hashedPassword,
        createdAt: new Date(),
        isActive: true,
      })

      // Create user settings with trial
      await database.createUserWithTrial(user._id!.toString())

      // Set auth cookie
      await this.setAuthCookie({
        id: user._id!.toString(),
        email: user.email,
        username: user.username,
      })

      const session = await this.getCurrentUser()
      return { success: true, message: "Account created successfully", user: session! }
    } catch (error) {
      console.error("Sign up error:", error)
      return { success: false, message: "Failed to create account" }
    }
  }

  static async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      // Find user
      const user = await database.getUserByEmail(email)
      if (!user) {
        return { success: false, message: "Invalid email or password" }
      }

      // Check password
      const isValidPassword = await this.comparePassword(password, user.password)
      if (!isValidPassword) {
        return { success: false, message: "Invalid email or password" }
      }

      // Update last login
      await database.updateUser(user._id!.toString(), { lastLoginAt: new Date() })

      // Set auth cookie
      await this.setAuthCookie({
        id: user._id!.toString(),
        email: user.email,
        username: user.username,
      })

      const session = await this.getCurrentUser()
      return { success: true, message: "Signed in successfully", user: session! }
    } catch (error) {
      console.error("Sign in error:", error)
      return { success: false, message: "Failed to sign in" }
    }
  }

  static async signOut(): Promise<void> {
    await this.clearAuthCookie()
  }
}

class AuthManager {
  async signUp(email: string, username: string, password: string): Promise<AuthResult> {
    return AuthService.signUp(email, username, password)
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    return AuthService.signIn(email, password)
  }

  async signOut(): Promise<void> {
    await AuthService.signOut()
  }

  async getCurrentUser(): Promise<UserSession | null> {
    return AuthService.getCurrentUser()
  }

  async requireAuth(): Promise<UserSession> {
    return AuthService.requireAuth()
  }

  async updateProfile(userId: string, updates: { username?: string; email?: string }): Promise<AuthResult> {
    try {
      await database.updateUser(userId, updates)
      return { success: true, message: "Profile updated successfully" }
    } catch (error) {
      console.error("Update profile error:", error)
      return { success: false, message: "Failed to update profile" }
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      const user = await database.getUserById(userId)
      if (!user) {
        return { success: false, message: "User not found" }
      }

      const isValidPassword = await AuthService.comparePassword(currentPassword, user.password)
      if (!isValidPassword) {
        return { success: false, message: "Current password is incorrect" }
      }

      const hashedPassword = await AuthService.hashPassword(newPassword)
      await database.updateUser(userId, { password: hashedPassword })

      return { success: true, message: "Password changed successfully" }
    } catch (error) {
      console.error("Change password error:", error)
      return { success: false, message: "Failed to change password" }
    }
  }
}

export const authManager = new AuthManager()

// Export functions for backward compatibility
export const getCurrentUser = AuthService.getCurrentUser
export const requireAuth = AuthService.requireAuth
export const signUp = AuthService.signUp
export const signIn = AuthService.signIn
export const signOut = AuthService.signOut
