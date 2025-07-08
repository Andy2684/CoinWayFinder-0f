import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { database } from "./database"

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  subscription: {
    plan: string
    status: string
    endDate: Date
  }
}

export class AuthManager {
  private static instance: AuthManager
  private jwtSecret: string

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || "your-secret-key-change-in-production"
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  generateToken(userId: string): string {
    return jwt.sign({ userId, iat: Date.now() }, this.jwtSecret, { expiresIn: "7d" })
  }

  verifyToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string }
      return decoded
    } catch (error) {
      return null
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get("auth-token")?.value

      if (!token) return null

      const decoded = this.verifyToken(token)
      if (!decoded) return null

      const userSettings = await database.getUserSettings(decoded.userId)
      if (!userSettings) return null

      return {
        id: decoded.userId,
        email: userSettings.userId, // Using userId as email for now
        name: userSettings.userId.split("@")[0] || "User",
        createdAt: userSettings.createdAt,
        subscription: userSettings.subscription,
      }
    } catch (error) {
      console.error("Get current user error:", error)
      return null
    }
  }

  async signUp(
    email: string,
    password: string,
    name: string,
  ): Promise<{
    success: boolean
    user?: User
    error?: string
  }> {
    try {
      // Check if user already exists
      const existingUser = await database.getUserSettings(email)
      if (existingUser) {
        return { success: false, error: "User already exists" }
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password)

      // Create user with trial
      const userSettings = await database.createUserWithTrial(email)

      // Store password (in production, you'd have a separate users table)
      // For now, we'll store it in user settings
      userSettings.preferences = {
        ...userSettings.preferences,
        // @ts-ignore - Adding password to preferences temporarily
        hashedPassword,
      }
      await database.saveUserSettings(userSettings)

      const user: User = {
        id: email,
        email,
        name,
        createdAt: userSettings.createdAt,
        subscription: userSettings.subscription,
      }

      return { success: true, user }
    } catch (error) {
      console.error("Sign up error:", error)
      return { success: false, error: "Failed to create account" }
    }
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{
    success: boolean
    user?: User
    token?: string
    error?: string
  }> {
    try {
      const userSettings = await database.getUserSettings(email)
      if (!userSettings) {
        return { success: false, error: "Invalid credentials" }
      }

      // @ts-ignore - Getting password from preferences temporarily
      const hashedPassword = userSettings.preferences?.hashedPassword
      if (!hashedPassword) {
        return { success: false, error: "Invalid credentials" }
      }

      const isValidPassword = await this.verifyPassword(password, hashedPassword)
      if (!isValidPassword) {
        return { success: false, error: "Invalid credentials" }
      }

      const token = this.generateToken(email)
      const user: User = {
        id: email,
        email,
        name: email.split("@")[0] || "User",
        createdAt: userSettings.createdAt,
        subscription: userSettings.subscription,
      }

      return { success: true, user, token }
    } catch (error) {
      console.error("Sign in error:", error)
      return { success: false, error: "Failed to sign in" }
    }
  }

  async checkSubscriptionStatus(userId: string): Promise<{
    isActive: boolean
    plan: string
    daysLeft: number
    shouldDisconnect: boolean
  }> {
    try {
      const userSettings = await database.getUserSettings(userId)
      if (!userSettings) {
        return { isActive: false, plan: "none", daysLeft: 0, shouldDisconnect: true }
      }

      const now = new Date()
      const endDate = new Date(userSettings.subscription.endDate)
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      const isActive = userSettings.subscription.status === "active" && endDate > now
      const shouldDisconnect = !isActive || daysLeft <= 0

      return {
        isActive,
        plan: userSettings.subscription.plan,
        daysLeft: Math.max(0, daysLeft),
        shouldDisconnect,
      }
    } catch (error) {
      console.error("Check subscription status error:", error)
      return { isActive: false, plan: "none", daysLeft: 0, shouldDisconnect: true }
    }
  }

  async disconnectExpiredUsers(): Promise<void> {
    try {
      // Get all running bots
      const runningBots = await database.getRunningBots()

      for (const bot of runningBots) {
        const subscriptionStatus = await this.checkSubscriptionStatus(bot.userId)

        if (subscriptionStatus.shouldDisconnect) {
          // Stop the bot
          await database.updateBot(bot._id!.toString(), bot.userId, {
            status: "stopped",
            lastError: "Subscription expired",
            lastErrorAt: new Date(),
          })

          console.log(`Stopped bot ${bot.name} for user ${bot.userId} - subscription expired`)
        }
      }
    } catch (error) {
      console.error("Disconnect expired users error:", error)
    }
  }
}

export const authManager = AuthManager.getInstance()
