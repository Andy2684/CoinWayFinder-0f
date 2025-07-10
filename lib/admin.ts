import { connectToDatabase } from "./database"
import { authService } from "./auth"
import jwt from "jsonwebtoken"

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalBots: number
  activeBots: number
  totalTrades: number
  totalRevenue: number
  subscriptionBreakdown: {
    free: number
    starter: number
    pro: number
    enterprise: number
  }
}

export interface AdminUser {
  id: string
  username: string
  role: "admin"
  createdAt: Date
  lastLogin?: Date
}

export class AdminManager {
  private db: any

  constructor() {
    this.initializeDatabase()
  }

  private async initializeDatabase() {
    this.db = await connectToDatabase()
  }

  async getCurrentAdmin(): Promise<AdminUser | null> {
    try {
      // This would typically check the current session/token
      // For now, we'll return a mock admin if authenticated
      const admin = await authService.getCurrentAdmin()
      return admin
    } catch (error) {
      console.error("Error getting current admin:", error)
      return null
    }
  }

  async getSystemStats(): Promise<AdminStats> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const [users, bots, trades] = await Promise.all([
        this.db.collection("users").find({ isActive: true }).toArray(),
        this.db.collection("bots").find({}).toArray(),
        this.db.collection("trades").find({}).toArray(),
      ])

      const activeUsers = users.filter(
        (user: any) =>
          user.stats?.lastActiveAt && new Date(user.stats.lastActiveAt) > new Date(Date.now() - 24 * 60 * 60 * 1000),
      ).length

      const activeBots = bots.filter((bot: any) => bot.status === "active").length

      const subscriptionBreakdown = users.reduce(
        (acc: any, user: any) => {
          const plan = user.subscription?.plan || "free"
          acc[plan] = (acc[plan] || 0) + 1
          return acc
        },
        { free: 0, starter: 0, pro: 0, enterprise: 0 },
      )

      // Calculate revenue (mock calculation)
      const totalRevenue = users.reduce((acc: number, user: any) => {
        const plan = user.subscription?.plan
        const prices = { starter: 29, pro: 99, enterprise: 299 }
        return acc + (prices[plan as keyof typeof prices] || 0)
      }, 0)

      return {
        totalUsers: users.length,
        activeUsers,
        totalBots: bots.length,
        activeBots,
        totalTrades: trades.length,
        totalRevenue,
        subscriptionBreakdown,
      }
    } catch (error) {
      console.error("Error getting system stats:", error)
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalBots: 0,
        activeBots: 0,
        totalTrades: 0,
        totalRevenue: 0,
        subscriptionBreakdown: { free: 0, starter: 0, pro: 0, enterprise: 0 },
      }
    }
  }

  async getAllUsers(page = 1, limit = 50): Promise<{ users: any[]; total: number; pages: number }> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const skip = (page - 1) * limit
      const [users, total] = await Promise.all([
        this.db.collection("users").find({ isActive: true }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
        this.db.collection("users").countDocuments({ isActive: true }),
      ])

      // Remove sensitive data
      const sanitizedUsers = users.map((user: any) => ({
        id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        subscription: user.subscription,
        stats: user.stats,
      }))

      return {
        users: sanitizedUsers,
        total,
        pages: Math.ceil(total / limit),
      }
    } catch (error) {
      console.error("Error getting all users:", error)
      return { users: [], total: 0, pages: 0 }
    }
  }

  async getUserDetails(userId: string): Promise<any> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const [user, bots, trades] = await Promise.all([
        this.db.collection("users").findOne({ _id: userId, isActive: true }),
        this.db.collection("bots").find({ userId }).toArray(),
        this.db.collection("trades").find({ userId }).sort({ timestamp: -1 }).limit(10).toArray(),
      ])

      if (!user) {
        return null
      }

      return {
        id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        subscription: user.subscription,
        stats: user.stats,
        bots: bots.map((bot: any) => ({
          id: bot._id,
          name: bot.name,
          strategy: bot.strategy,
          status: bot.status,
          performance: bot.performance,
        })),
        recentTrades: trades.map((trade: any) => ({
          id: trade._id,
          symbol: trade.symbol,
          type: trade.type,
          amount: trade.amount,
          price: trade.price,
          timestamp: trade.timestamp,
          status: trade.status,
        })),
      }
    } catch (error) {
      console.error("Error getting user details:", error)
      return null
    }
  }

  async updateUserSubscription(userId: string, subscription: any): Promise<boolean> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const result = await this.db.collection("users").updateOne(
        { _id: userId },
        {
          $set: {
            subscription,
            updatedAt: new Date(),
          },
        },
      )

      return result.modifiedCount > 0
    } catch (error) {
      console.error("Error updating user subscription:", error)
      return false
    }
  }

  async deactivateUser(userId: string): Promise<boolean> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const result = await this.db.collection("users").updateOne(
        { _id: userId },
        {
          $set: {
            isActive: false,
            updatedAt: new Date(),
          },
        },
      )

      return result.modifiedCount > 0
    } catch (error) {
      console.error("Error deactivating user:", error)
      return false
    }
  }

  async reactivateUser(userId: string): Promise<boolean> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const result = await this.db.collection("users").updateOne(
        { _id: userId },
        {
          $set: {
            isActive: true,
            updatedAt: new Date(),
          },
        },
      )

      return result.modifiedCount > 0
    } catch (error) {
      console.error("Error reactivating user:", error)
      return false
    }
  }

  async getSystemLogs(page = 1, limit = 100): Promise<{ logs: any[]; total: number; pages: number }> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const skip = (page - 1) * limit
      const [logs, total] = await Promise.all([
        this.db.collection("systemLogs").find({}).sort({ timestamp: -1 }).skip(skip).limit(limit).toArray(),
        this.db.collection("systemLogs").countDocuments(),
      ])

      return {
        logs,
        total,
        pages: Math.ceil(total / limit),
      }
    } catch (error) {
      console.error("Error getting system logs:", error)
      return { logs: [], total: 0, pages: 0 }
    }
  }

  async createSystemLog(level: string, message: string, metadata?: any): Promise<void> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      await this.db.collection("systemLogs").insertOne({
        level,
        message,
        metadata,
        timestamp: new Date(),
      })
    } catch (error) {
      console.error("Error creating system log:", error)
    }
  }

  async getPerformanceMetrics(): Promise<any> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const [avgResponseTime, errorRate, uptime] = await Promise.all([
        this.calculateAverageResponseTime(),
        this.calculateErrorRate(),
        this.calculateUptime(),
      ])

      return {
        avgResponseTime,
        errorRate,
        uptime,
        lastUpdated: new Date(),
      }
    } catch (error) {
      console.error("Error getting performance metrics:", error)
      return {
        avgResponseTime: 0,
        errorRate: 0,
        uptime: 100,
        lastUpdated: new Date(),
      }
    }
  }

  private async calculateAverageResponseTime(): Promise<number> {
    // Mock implementation - in real app, this would calculate from actual metrics
    return Math.random() * 100 + 50 // 50-150ms
  }

  private async calculateErrorRate(): Promise<number> {
    // Mock implementation - in real app, this would calculate from actual error logs
    return Math.random() * 5 // 0-5% error rate
  }

  private async calculateUptime(): Promise<number> {
    // Mock implementation - in real app, this would calculate actual uptime
    return 99.9 - Math.random() * 0.5 // 99.4-99.9% uptime
  }
}

export async function verifyAdminToken(token: string): Promise<AdminUser | null> {
  try {
    if (!token) {
      return null
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    if (!decoded || decoded.role !== "admin") {
      return null
    }

    // Get admin from database
    const admin = await adminManager.getCurrentAdmin()

    if (!admin || admin.id !== decoded.userId) {
      return null
    }

    return admin
  } catch (error) {
    console.error("Error verifying admin token:", error)
    return null
  }
}

export const adminManager = new AdminManager()
