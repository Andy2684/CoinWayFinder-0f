import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { database } from "./database"

const ADMIN_JWT_SECRET = process.env.JWT_SECRET || "admin-secret-key-change-in-production"
const ADMIN_JWT_EXPIRES_IN = "24h"

// Hardcoded admin credentials (change in production)
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "CoinWayFinder2024!",
  email: "admin@coinwayfinder.com",
}

export interface AdminUser {
  userId: string
  username: string
  email: string
  isAdmin: boolean
}

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  subscriptions: {
    free: number
    starter: number
    pro: number
    enterprise: number
  }
  recentSignups: number
  activeTrials: number
}

export class AdminService {
  static async validateAdminCredentials(username: string, password: string): Promise<boolean> {
    return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password
  }

  static generateAdminToken(admin: AdminUser): string {
    return jwt.sign(
      {
        userId: admin.userId,
        username: admin.username,
        email: admin.email,
        isAdmin: true,
      },
      ADMIN_JWT_SECRET,
      { expiresIn: ADMIN_JWT_EXPIRES_IN },
    )
  }

  static verifyAdminToken(token: string): AdminUser | null {
    try {
      const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as any
      if (!decoded.isAdmin) {
        return null
      }
      return {
        userId: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        isAdmin: decoded.isAdmin,
      }
    } catch (error) {
      return null
    }
  }

  static async setAdminCookie(admin: AdminUser): Promise<void> {
    const token = this.generateAdminToken(admin)
    const cookieStore = await cookies()

    cookieStore.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    })
  }

  static async clearAdminCookie(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete("admin-token")
  }

  static async getCurrentAdmin(): Promise<AdminUser | null> {
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get("admin-token")?.value

      if (!token) {
        return null
      }

      return this.verifyAdminToken(token)
    } catch (error) {
      return null
    }
  }

  static async signIn(
    username: string,
    password: string,
  ): Promise<{ success: boolean; message: string; admin?: AdminUser }> {
    try {
      const isValid = await this.validateAdminCredentials(username, password)
      if (!isValid) {
        return { success: false, message: "Invalid admin credentials" }
      }

      const admin: AdminUser = {
        userId: "admin-user-id",
        username: ADMIN_CREDENTIALS.username,
        email: ADMIN_CREDENTIALS.email,
        isAdmin: true,
      }

      await this.setAdminCookie(admin)

      return { success: true, message: "Admin signed in successfully", admin }
    } catch (error) {
      console.error("Admin sign in error:", error)
      return { success: false, message: "Failed to sign in as admin" }
    }
  }

  static async signOut(): Promise<void> {
    await this.clearAdminCookie()
  }

  static async requireAdmin(): Promise<AdminUser> {
    const admin = await this.getCurrentAdmin()
    if (!admin) {
      throw new Error("Admin authentication required")
    }
    return admin
  }

  static async getAdminStats(): Promise<AdminStats> {
    try {
      // Get all users
      const allUsers = await database.getAllUsers()
      const totalUsers = allUsers.length

      // Count active users (logged in within last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const activeUsers = allUsers.filter((user) => user.lastLoginAt && user.lastLoginAt > thirtyDaysAgo).length

      // Count recent signups (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const recentSignups = allUsers.filter((user) => user.createdAt && user.createdAt > sevenDaysAgo).length

      // Get subscription stats
      const subscriptions = {
        free: 0,
        starter: 0,
        pro: 0,
        enterprise: 0,
      }

      let totalRevenue = 0
      let activeTrials = 0

      for (const user of allUsers) {
        const settings = await database.getUserSettings(user._id!.toString())
        if (settings?.subscription) {
          const plan = settings.subscription.plan
          if (plan in subscriptions) {
            subscriptions[plan as keyof typeof subscriptions]++
          }

          // Calculate revenue (simplified)
          if (plan === "starter") totalRevenue += 29
          if (plan === "pro") totalRevenue += 99
          if (plan === "enterprise") totalRevenue += 299
        }

        if (settings?.trial?.isActive) {
          activeTrials++
        }
      }

      return {
        totalUsers,
        activeUsers,
        totalRevenue,
        subscriptions,
        recentSignups,
        activeTrials,
      }
    } catch (error) {
      console.error("Error getting admin stats:", error)
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalRevenue: 0,
        subscriptions: { free: 0, starter: 0, pro: 0, enterprise: 0 },
        recentSignups: 0,
        activeTrials: 0,
      }
    }
  }

  static async getAllUsers(): Promise<any[]> {
    try {
      return await database.getAllUsers()
    } catch (error) {
      console.error("Error getting all users:", error)
      return []
    }
  }

  static async updateUserSubscription(
    userId: string,
    plan: string,
    status: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await database.updateUserSettings(userId, {
        subscription: {
          plan,
          status,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      })

      return { success: true, message: "User subscription updated successfully" }
    } catch (error) {
      console.error("Error updating user subscription:", error)
      return { success: false, message: "Failed to update user subscription" }
    }
  }

  static async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      await database.deleteUser(userId)
      return { success: true, message: "User deleted successfully" }
    } catch (error) {
      console.error("Error deleting user:", error)
      return { success: false, message: "Failed to delete user" }
    }
  }
}

// Export for backward compatibility
export const adminService = AdminService
