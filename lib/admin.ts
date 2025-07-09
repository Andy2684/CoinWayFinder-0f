import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin-secret-key-change-in-production"

// Admin system with backdoor access for project.command.center@gmail.com
interface AdminUser {
  id: string
  username: string
  email: string
  password: string
  isAdmin: boolean
  createdAt: string
  lastLogin?: string
}

export interface AdminSession {
  userId: string
  username: string
  email: string
  isAdmin: boolean
  token: string
  expiresAt: number
}

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalBots: number
  activeBots: number
  totalTrades: number
  totalVolume: number
  subscriptionBreakdown: Record<string, number>
  revenueStats: {
    monthly: number
    total: number
  }
}

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  username: "admin",
  email: "project.command.center@gmail.com",
  password: "CoinWayFinder2024!",
}

export class AdminService {
  private static adminSessions = new Map<string, AdminSession>()

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateAdminToken(admin: AdminUser): string {
    return jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        isAdmin: true,
      },
      ADMIN_JWT_SECRET,
      { expiresIn: "24h" },
    )
  }

  static verifyAdminToken(token: string): AdminSession | null {
    try {
      const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as any
      return {
        userId: decoded.id,
        username: decoded.username,
        email: decoded.email,
        isAdmin: decoded.isAdmin,
        token,
        expiresAt: decoded.exp * 1000,
      }
    } catch (error) {
      return null
    }
  }

  static async validateAdminCredentials(
    username: string,
    password: string,
  ): Promise<{ success: boolean; admin?: AdminUser }> {
    // Check hardcoded admin credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const admin: AdminUser = {
        id: "admin-001",
        username: ADMIN_CREDENTIALS.username,
        email: ADMIN_CREDENTIALS.email,
        password: await this.hashPassword(ADMIN_CREDENTIALS.password),
        isAdmin: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }
      return { success: true, admin }
    }

    return { success: false }
  }

  static async setAdminCookie(admin: AdminUser): Promise<void> {
    const token = this.generateAdminToken(admin)
    const cookieStore = await cookies()

    // Store session
    const session: AdminSession = {
      userId: admin.id,
      username: admin.username,
      email: admin.email,
      isAdmin: true,
      token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }

    this.adminSessions.set(token, session)

    cookieStore.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    })
  }

  static async clearAdminCookie(): Promise<void> {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin-token")?.value

    if (token) {
      this.adminSessions.delete(token)
    }

    cookieStore.delete("admin-token")
  }

  static async getCurrentAdmin(): Promise<AdminSession | null> {
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get("admin-token")?.value

      if (!token) {
        return null
      }

      // Check session store first
      const session = this.adminSessions.get(token)
      if (session && session.expiresAt > Date.now()) {
        return session
      }

      // Verify token
      const adminSession = this.verifyAdminToken(token)
      if (!adminSession) {
        return null
      }

      return adminSession
    } catch (error) {
      return null
    }
  }

  static async requireAdmin(): Promise<AdminSession> {
    const admin = await this.getCurrentAdmin()
    if (!admin) {
      throw new Error("Admin authentication required")
    }
    return admin
  }

  static async getAdminStats(): Promise<SystemStats> {
    // Mock stats - in real implementation, query your database
    return {
      totalUsers: 1247,
      activeUsers: 892,
      totalBots: 3456,
      activeBots: 1234,
      totalTrades: 45678,
      totalVolume: 2345678.9,
      subscriptionBreakdown: {
        free: 800,
        basic: 300,
        premium: 120,
        enterprise: 27,
      },
      revenueStats: {
        monthly: 45000,
        total: 234567,
      },
    }
  }
}

class AdminManager {
  bypassSubscriptionCheck(adminSession: AdminSession | null): boolean {
    return adminSession?.isAdmin === true && adminSession.expiresAt > Date.now()
  }

  async getSystemHealth(): Promise<{
    status: "healthy" | "warning" | "critical"
    services: Record<string, boolean>
    uptime: number
  }> {
    return {
      status: "healthy",
      services: {
        database: true,
        redis: true,
        telegram: true,
        exchanges: true,
        payments: true,
      },
      uptime: process.uptime(),
    }
  }

  async getRecentActivity(): Promise<
    Array<{
      id: string
      type: "user_signup" | "bot_created" | "trade_executed" | "subscription_upgraded"
      userId: string
      timestamp: string
      details: Record<string, any>
    }>
  > {
    // Mock recent activity
    return [
      {
        id: "1",
        type: "user_signup",
        userId: "user-123",
        timestamp: new Date().toISOString(),
        details: { email: "user@example.com" },
      },
      {
        id: "2",
        type: "bot_created",
        userId: "user-456",
        timestamp: new Date().toISOString(),
        details: { strategy: "DCA", exchange: "binance" },
      },
    ]
  }
}

export const adminManager = new AdminManager()

// Export functions for backward compatibility
export const verifyAdminToken = AdminService.verifyAdminToken
export const getAdminStats = AdminService.getAdminStats
export const validateAdminCredentials = AdminService.validateAdminCredentials
export const generateAdminToken = AdminService.generateAdminToken
