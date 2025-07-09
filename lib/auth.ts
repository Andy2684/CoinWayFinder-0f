import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { database } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const JWT_EXPIRES_IN = "7d"

export interface User {
  id: string
  email: string
  username: string
  createdAt: Date
  lastLoginAt?: Date
  emailVerified?: boolean
}

export interface AuthSession {
  userId: string
  email: string
  username: string
  token: string
  expiresAt: number
}

export class AuthService {
  private static sessions = new Map<string, AuthSession>()

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    )
  }

  static verifyToken(token: string): AuthSession | null {
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
    const session: AuthSession = {
      userId: user.id,
      email: user.email,
      username: user.username,
      token,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    }

    this.sessions.set(token, session)

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
      this.sessions.delete(token)
    }

    cookieStore.delete("auth-token")
  }

  static async getCurrentUser(): Promise<AuthSession | null> {
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get("auth-token")?.value

      if (!token) {
        return null
      }

      // Check session store first
      const session = this.sessions.get(token)
      if (session && session.expiresAt > Date.now()) {
        return session
      }

      // Verify token
      const authSession = this.verifyToken(token)
      if (!authSession) {
        return null
      }

      return authSession
    } catch (error) {
      return null
    }
  }

  static async requireAuth(): Promise<AuthSession> {
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
      const newUser = await database.createUser({
        email,
        username,
        password: hashedPassword,
        createdAt: new Date(),
        emailVerified: false,
        isActive: true,
      })

      // Create user settings with trial
      await database.createUserWithTrial(newUser._id!.toString())

      const user: User = {
        id: newUser._id!.toString(),
        email: newUser.email,
        username: newUser.username,
        createdAt: newUser.createdAt,
        emailVerified: newUser.emailVerified,
      }

      await this.setAuthCookie(user)

      return { success: true, message: "User created successfully", user }
    } catch (error) {
      console.error("Sign up error:", error)
      return { success: false, message: "Failed to create user" }
    }
  }

  static async signIn(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Find user
      const dbUser = await database.getUserByEmail(email)
      if (!dbUser) {
        return { success: false, message: "Invalid email or password" }
      }

      // Verify password
      const isValidPassword = await this.comparePassword(password, dbUser.password)
      if (!isValidPassword) {
        return { success: false, message: "Invalid email or password" }
      }

      // Update last login
      await database.updateUser(dbUser._id!.toString(), {
        lastLoginAt: new Date(),
      })

      const user: User = {
        id: dbUser._id!.toString(),
        email: dbUser.email,
        username: dbUser.username,
        createdAt: dbUser.createdAt,
        lastLoginAt: new Date(),
        emailVerified: dbUser.emailVerified,
      }

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

      // Verify current password
      const isValidPassword = await this.comparePassword(currentPassword, user.password)
      if (!isValidPassword) {
        return { success: false, message: "Current password is incorrect" }
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword)

      // Update password
      await database.updateUser(userId, {
        password: hashedNewPassword,
      })

      return { success: true, message: "Password updated successfully" }
    } catch (error) {
      console.error("Update password error:", error)
      return { success: false, message: "Failed to update password" }
    }
  }

  static async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await database.getUserByEmail(email)
      if (!user) {
        // Don't reveal if user exists or not
        return { success: true, message: "If the email exists, a reset link has been sent" }
      }

      // Generate reset token
      const resetToken = Math.random().toString(36).substring(2, 15)
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await database.updateUser(user._id!.toString(), {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      })

      // In a real app, you would send an email here
      console.log(`Password reset token for ${email}: ${resetToken}`)

      return { success: true, message: "If the email exists, a reset link has been sent" }
    } catch (error) {
      console.error("Reset password error:", error)
      return { success: false, message: "Failed to process password reset" }
    }
  }

  static async confirmPasswordReset(
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Find user by reset token
      const users = await database.getAllUsers()
      const user = users.find(
        (u) => u.resetPasswordToken === token && u.resetPasswordExpires && u.resetPasswordExpires > new Date(),
      )

      if (!user) {
        return { success: false, message: "Invalid or expired reset token" }
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword)

      // Update password and clear reset token
      await database.updateUser(user._id!.toString(), {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      })

      return { success: true, message: "Password reset successfully" }
    } catch (error) {
      console.error("Confirm password reset error:", error)
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

  async resetPassword(email: string) {
    return AuthService.resetPassword(email)
  }

  async confirmPasswordReset(token: string, newPassword: string) {
    return AuthService.confirmPasswordReset(token, newPassword)
  }
}

export const authManager = new AuthManager()
