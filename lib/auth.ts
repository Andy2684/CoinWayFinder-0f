import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { database } from "./database"
import { AdminService } from "./admin"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const JWT_EXPIRES_IN = "7d"

export interface AuthUser {
  id: string
  email: string
  name: string
  subscription?: {
    plan: string
    status: string
    endDate: Date
  }
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateToken(user: AuthUser): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    )
  }

  static verifyToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      return {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      }
    } catch (error) {
      return null
    }
  }

  static async setAuthCookie(user: AuthUser): Promise<void> {
    const token = this.generateToken(user)
    const cookieStore = await cookies()

    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })
  }

  static async clearAuthCookie(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete("auth-token")
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // Check if admin is logged in first
      const admin = await AdminService.getCurrentAdmin()
      if (admin) {
        return {
          id: admin.id,
          email: admin.email,
          name: admin.username,
          subscription: {
            plan: "admin",
            status: "active",
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          },
        }
      }

      const cookieStore = await cookies()
      const token = cookieStore.get("auth-token")?.value

      if (!token) {
        return null
      }

      const user = this.verifyToken(token)
      if (!user) {
        return null
      }

      // Get user settings to include subscription info
      const userSettings = await database.getUserSettings(user.id)
      if (userSettings) {
        user.subscription = userSettings.subscription
      }

      return user
    } catch (error) {
      return null
    }
  }

  static async signUp(
    email: string,
    password: string,
    name: string,
  ): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    try {
      // Check if user already exists
      const existingUser = await database.getUserByEmail(email)
      if (existingUser) {
        return { success: false, message: "User already exists with this email" }
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password)

      // Create user
      const userId = await database.createUser({
        email,
        password: hashedPassword,
        name,
        isVerified: true, // Auto-verify for now
      })

      // Create user settings with trial
      const userSettings = await database.createUserWithTrial(userId)

      const user: AuthUser = {
        id: userId,
        email,
        name,
        subscription: userSettings.subscription,
      }
      await this.setAuthCookie(user)

      return { success: true, message: "Account created successfully", user }
    } catch (error) {
      console.error("Sign up error:", error)
      return { success: false, message: "Failed to create account" }
    }
  }

  static async signIn(
    email: string,
    password: string,
  ): Promise<{ success: boolean; message: string; user?: AuthUser }> {
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

      // Get user settings
      const userSettings = await database.getUserSettings(user._id!.toString())

      const authUser: AuthUser = {
        id: user._id!.toString(),
        email: user.email,
        name: user.name,
        subscription: userSettings?.subscription,
      }

      await this.setAuthCookie(authUser)

      return { success: true, message: "Signed in successfully", user: authUser }
    } catch (error) {
      console.error("Sign in error:", error)
      return { success: false, message: "Failed to sign in" }
    }
  }

  static async signOut(): Promise<void> {
    await this.clearAuthCookie()
  }

  static async requireAuth(): Promise<AuthUser> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error("Authentication required")
    }
    return user
  }
}
