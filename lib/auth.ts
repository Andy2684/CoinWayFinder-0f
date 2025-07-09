import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { database } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const JWT_EXPIRES_IN = "7d"

export interface User {
  _id?: string
  id?: string
  email: string
  username: string
  password: string
  createdAt: Date
  lastLoginAt?: Date
  emailVerified?: boolean
  resetPasswordToken?: string
  resetPasswordExpires?: Date
}

export interface UserSession {
  userId: string
  email: string
  username: string
  token: string
  expiresAt: number
}

export class AuthService {
  private static userSessions = new Map<string, UserSession>()

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user._id || user.id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
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

  static async setAuthCookie(user: User): Promise<void> {
    const token = this.generateToken(user)
    const cookieStore = await cookies()

    // Store session
    const session: UserSession = {
      userId: user._id || user.id || "",
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

  static async signUp(
    email: string,
    username: string,
    password: string,
  ): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Check if user already exists
      const existingUser = await database.getUserByEmail(email)
      if (existingUser) {
        return { success: false, message: "User already exists with this email" }
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password)

      // Create user
      const newUser: User = {
        email,
        username,
        password: hashedPassword,
        createdAt: new Date(),
        emailVerified: false,
      }

      const createdUser = await database.createUser(newUser)
      if (!createdUser) {
        return { success: false, message: "Failed to create user" }
      }

      // Set auth cookie
      await this.setAuthCookie(createdUser)

      return { success: true, message: "User created successfully", user: createdUser }
    } catch (error) {
      console.error("Sign up error:", error)
      return { success: false, message: "Failed to create user" }
    }
  }

  static async signIn(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
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
      await this.setAuthCookie(user)

      return { success: true, message: "Signed in successfully", user }
    } catch (error) {
      console.error("Sign in error:", error)
      return { success: false, message: "Failed to sign in" }
    }
  }

  static async signOut(): Promise<void> {
    await this.clearAuthCookie()
  }

  static async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await database.getUserById(userId)
      if (!user) {
        return { success: false, message: "User not found" }
      }

      const isValidPassword = await this.comparePassword(currentPassword, user.password)
      if (!isValidPassword) {
        return { success: false, message: "Current password is incorrect" }
      }

      const hashedNewPassword = await this.hashPassword(newPassword)
      await database.updateUser(userId, { password: hashedNewPassword })

      return { success: true, message: "Password updated successfully" }
    } catch (error) {
      console.error("Update password error:", error)
      return { success: false, message: "Failed to update password" }
    }
  }

  static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await database.getUserByEmail(email)
      if (!user) {
        // Don't reveal if user exists
        return { success: true, message: "If the email exists, a reset link has been sent" }
      }

      // Generate reset token
      const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" })
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await database.updateUser(user._id!.toString(), {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      })

      // In a real app, send email here
      console.log(`Password reset token for ${email}: ${resetToken}`)

      return { success: true, message: "If the email exists, a reset link has been sent" }
    } catch (error) {
      console.error("Password reset request error:", error)
      return { success: false, message: "Failed to process password reset request" }
    }
  }

  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      const user = await database.getUserById(decoded.userId)

      if (!user || user.resetPasswordToken !== token || !user.resetPasswordExpires) {
        return { success: false, message: "Invalid or expired reset token" }
      }

      if (user.resetPasswordExpires < new Date()) {
        return { success: false, message: "Reset token has expired" }
      }

      const hashedPassword = await this.hashPassword(newPassword)
      await database.updateUser(user._id!.toString(), {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      })

      return { success: true, message: "Password reset successfully" }
    } catch (error) {
      console.error("Password reset error:", error)
      return { success: false, message: "Failed to reset password" }
    }
  }
}

class AuthManager {
  async signUp(email: string, username: string, password: string) {
    return AuthService.signUp(email, username, password)
  }

  async signIn(email: string, password: string) {
    return AuthService.signIn(email, password)
  }

  async signOut() {
    return AuthService.signOut()
  }

  async getCurrentUser() {
    return AuthService.getCurrentUser()
  }

  async requireAuth() {
    return AuthService.requireAuth()
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    return AuthService.updatePassword(userId, currentPassword, newPassword)
  }

  async requestPasswordReset(email: string) {
    return AuthService.requestPasswordReset(email)
  }

  async resetPassword(token: string, newPassword: string) {
    return AuthService.resetPassword(token, newPassword)
  }

  verifyToken(token: string) {
    return AuthService.verifyToken(token)
  }

  generateToken(user: User) {
    return AuthService.generateToken(user)
  }
}

export const authManager = new AuthManager()
export { AuthManager }
