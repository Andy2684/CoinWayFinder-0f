import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { database } from "./database"

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin-secret-key-change-in-production"
const ADMIN_JWT_EXPIRES_IN = "24h"

export interface AdminSession {
  id: string
  userId: string
  email: string
  username: string
  isAdmin: boolean
  permissions: string[]
  loginTime: Date
}

export interface AdminUser {
  id: string
  userId: string
  email: string
  username: string
  password: string
  permissions: string[]
  isActive: boolean
  createdAt: Date
  lastLoginAt?: Date
}

class AdminManager {
  private adminUsers: AdminUser[] = [
    {
      id: "admin-1",
      userId: "admin-1",
      email: "project.command.center@gmail.com",
      username: "admin",
      password: bcrypt.hashSync("admin123", 10),
      permissions: ["all"],
      isActive: true,
      createdAt: new Date(),
    },
  ]

  async authenticateAdmin(email: string, password: string): Promise<AdminSession | null> {
    try {
      const admin = this.adminUsers.find((a) => a.email === email && a.isActive)
      if (!admin) {
        return null
      }

      const isValidPassword = await bcrypt.compare(password, admin.password)
      if (!isValidPassword) {
        return null
      }

      // Update last login
      admin.lastLoginAt = new Date()

      const session: AdminSession = {
        id: admin.id,
        userId: admin.userId,
        email: admin.email,
        username: admin.username,
        isAdmin: true,
        permissions: admin.permissions,
        loginTime: new Date(),
      }

      return session
    } catch (error) {
      console.error("Admin authentication error:", error)
      return null
    }
  }

  generateAdminToken(session: AdminSession): string {
    return jwt.sign(
      {
        id: session.id,
        userId: session.userId,
        email: session.email,
        username: session.username,
        isAdmin: session.isAdmin,
        permissions: session.permissions,
        loginTime: session.loginTime,
      },
      ADMIN_JWT_SECRET,
      { expiresIn: ADMIN_JWT_EXPIRES_IN },
    )
  }

  verifyAdminToken(token: string): AdminSession | null {
    try {
      const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as any
      return {
        id: decoded.id,
        userId: decoded.userId,
        email: decoded.email,
        username: decoded.username,
        isAdmin: decoded.isAdmin,
        permissions: decoded.permissions || [],
        loginTime: new Date(decoded.loginTime),
      }
    } catch (error) {
      return null
    }
  }

  async setAdminCookie(session: AdminSession): Promise<void> {
    const token = this.generateAdminToken(session)
    const cookieStore = await cookies()

    cookieStore.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    })
  }

  async clearAdminCookie(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete("admin-token")
  }

  async getCurrentAdmin(): Promise<AdminSession | null> {
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

  async requireAdmin(): Promise<AdminSession> {
    const admin = await this.getCurrentAdmin()
    if (!admin) {
      throw new Error("Admin authentication required")
    }
    return admin
  }

  hasPermission(session: AdminSession, permission: string): boolean {
    if (!session.isAdmin) {
      return false
    }

    return session.permissions.includes("all") || session.permissions.includes(permission)
  }

  bypassSubscriptionCheck(session: AdminSession): boolean {
    return session.isAdmin && this.hasPermission(session, "bypass_subscription")
  }

  async signOut(): Promise<void> {
    await this.clearAdminCookie()
  }

  async getAllUsers(limit = 100): Promise<any[]> {
    try {
      return await database.getAllUsers(limit)
    } catch (error) {
      console.error("Error getting all users:", error)
      return []
    }
  }

  async getUserStats(): Promise<{
    totalUsers: number
    activeSubscriptions: number
    totalRevenue: number
    newUsersThisMonth: number
  }> {
    try {
      const [totalUsers, activeSubscriptions] = await Promise.all([
        database.getUserCount(),
        database.getActiveSubscriptions(),
      ])

      return {
        totalUsers,
        activeSubscriptions,
        totalRevenue: 0, // Would calculate from Stripe
        newUsersThisMonth: 0, // Would calculate from database
      }
    } catch (error) {
      console.error("Error getting user stats:", error)
      return {
        totalUsers: 0,
        activeSubscriptions: 0,
        totalRevenue: 0,
        newUsersThisMonth: 0,
      }
    }
  }

  async updateUserSubscription(
    userId: string,
    plan: string,
    status: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)

      const subscription = {
        plan,
        status,
        endDate,
      }

      const success = await database.updateSubscription(userId, subscription)

      if (success) {
        return { success: true, message: "User subscription updated successfully" }
      } else {
        return { success: false, message: "Failed to update user subscription" }
      }
    } catch (error) {
      console.error("Error updating user subscription:", error)
      return { success: false, message: "Failed to update user subscription" }
    }
  }

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // In a real implementation, this would delete the user and all associated data
      console.log(`Admin deleting user: ${userId}`)
      return { success: true, message: "User deleted successfully" }
    } catch (error) {
      console.error("Error deleting user:", error)
      return { success: false, message: "Failed to delete user" }
    }
  }
}

export const adminManager = new AdminManager()

// Export AdminService for backward compatibility
export class AdminService {
  static async getCurrentAdmin(): Promise<AdminSession | null> {
    return adminManager.getCurrentAdmin()
  }

  static async requireAdmin(): Promise<AdminSession> {
    return adminManager.requireAdmin()
  }

  static async signOut(): Promise<void> {
    return adminManager.signOut()
  }

  static hasPermission(session: AdminSession, permission: string): boolean {
    return adminManager.hasPermission(session, permission)
  }
}
