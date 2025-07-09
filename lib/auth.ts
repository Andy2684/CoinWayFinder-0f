import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { database } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export interface User {
  id: string
  email: string
  username: string
  createdAt: string
  lastLoginAt?: string
  emailVerified?: boolean
  isActive?: boolean
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
        id: user.id,
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
        userId: decoded.id,
        email: decoded.email,
        username: decoded.username,
        token,
        expiresAt: decoded.exp * 1000,
      }
    } catch (error) {
      return null
    }
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
        return { success: false, message: "User already exists" }
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password)

      // Create user
      const userData = {
        email,
        username,
        password: hashedPassword,
        createdAt: new Date(),
        emailVerified: false,
        isActive: true,
      }

      const newUser = await database.createUser(userData)

      // Create user settings with trial
      await database.createUserWithTrial(newUser._id!.toString())

      const user: User = {
        id: newUser._id!.toString(),
        email: newUser.email,
        username: newUser.username,
        createdAt: newUser.createdAt.toISOString(),
        emailVerified: newUser.emailVerified,
        isActive: newUser.isActive,
      }

      return { success: true, message: "User created successfully", user }
    } catch (error) {
      console.error("Sign up error:", error)
      return { success: false, message: "Failed to create user" }
    }
  }

  static async signIn(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const dbUser = await database.getUserByEmail(email)
      if (!dbUser) {
        return { success: false, message: "Invalid credentials" }
      }

      const isValidPassword = await this.comparePassword(password, dbUser.password)
      if (!isValidPassword) {
        return { success: false, message: "Invalid credentials" }
      }

      // Update last login
      await database.updateUser(dbUser._id!.toString(), { lastLoginAt: new Date() })

      const user: User = {
        id: dbUser._id!.toString(),
        email: dbUser.email,
        username: dbUser.username,
        createdAt: dbUser.createdAt.toISOString(),
        lastLoginAt: new Date().toISOString(),
        emailVerified: dbUser.emailVerified,
        isActive: dbUser.isActive,
      }

      return { success: true, message: "Sign in successful", user }
    } catch (error) {
      console.error("Sign in error:", error)
      return { success: false, message: "Failed to sign in" }
    }
  }

  static async setUserCookie(user: User): Promise<void> {
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

  static async clearUserCookie(): Promise<void> {
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
}

class AuthManager {
  async signUp(
    email: string,
    username: string,
    password: string,
  ): Promise<{ success: boolean; message: string; user?: User }> {
    const result = await AuthService.signUp(email, username, password)
    if (result.success && result.user) {
      await AuthService.setUserCookie(result.user)
    }
    return result
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    const result = await AuthService.signIn(email, password)
    if (result.success && result.user) {
      await AuthService.setUserCookie(result.user)
    }
    return result
  }

  async signOut(): Promise<void> {
    await AuthService.clearUserCookie()
  }

  async getCurrentUser(): Promise<UserSession | null> {
    return AuthService.getCurrentUser()
  }

  async requireAuth(): Promise<UserSession> {
    return AuthService.requireAuth()
  }
}

export const authManager = new AuthManager()

// Export functions for backward compatibility
export const hashPassword = AuthService.hashPassword
export const comparePassword = AuthService.comparePassword
export const generateToken = AuthService.generateToken
export const verifyToken = AuthService.verifyToken
export const getCurrentUser = AuthService.getCurrentUser
export const requireAuth = AuthService.requireAuth
