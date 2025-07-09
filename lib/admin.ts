import jwt from "jsonwebtoken"
import { connectToDatabase } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "CoinWayFinder2024!",
}

export interface AdminUser {
  id: string
  username: string
  role: "admin"
  createdAt: Date
}

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalBots: number
  activeBots: number
  totalRevenue: number
  monthlyRevenue: number
}

class AdminManager {
  private sessions: Map<string, { userId: string; expiresAt: Date }> = new Map()

  async validateCredentials(username: string, password: string): Promise<boolean> {
    return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password
  }

  async generateToken(username: string): Promise<string> {
    const payload = {
      username,
      role: "admin",
      type: "admin",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    }

    return jwt.sign(payload, JWT_SECRET)
  }

  async verifyToken(token: string): Promise<AdminUser | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any

      if (decoded.type !== "admin" || decoded.username !== ADMIN_CREDENTIALS.username) {
        return null
      }

      return {
        id: "admin",
        username: decoded.username,
        role: "admin",
        createdAt: new Date(),
      }
    } catch (error) {
      return null
    }
  }

  async getStats(): Promise<AdminStats> {
    try {
      const { db } = await connectToDatabase()

      const [totalUsers, activeUsers, totalBots, activeBots] = await Promise.all([
        db.collection("users").countDocuments(),
        db
          .collection("users")
          .countDocuments({ lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
        db.collection("bots").countDocuments(),
        db.collection("bots").countDocuments({ status: "active" }),
      ])

      // Calculate revenue (mock data for now)
      const totalRevenue = totalUsers * 29.99 // Assuming average subscription
      const monthlyRevenue = activeUsers * 29.99

      return {
        totalUsers,
        activeUsers,
        totalBots,
        activeBots,
        totalRevenue,
        monthlyRevenue,
      }
    } catch (error) {
      console.error("Error getting admin stats:", error)
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalBots: 0,
        activeBots: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
      }
    }
  }

  createSession(userId: string): string {
    const sessionId = Math.random().toString(36).substring(2, 15)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    this.sessions.set(sessionId, { userId, expiresAt })
    return sessionId
  }

  validateSession(sessionId: string): string | null {
    const session = this.sessions.get(sessionId)
    if (!session || session.expiresAt < new Date()) {
      this.sessions.delete(sessionId)
      return null
    }
    return session.userId
  }

  destroySession(sessionId: string): void {
    this.sessions.delete(sessionId)
  }

  // Cleanup expired sessions
  cleanupSessions(): void {
    const now = new Date()
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId)
      }
    }
  }
}

// Create singleton instance
export const adminManager = new AdminManager()

// Export individual functions for backward compatibility
export async function validateAdminCredentials(username: string, password: string): Promise<boolean> {
  return adminManager.validateCredentials(username, password)
}

export async function generateAdminToken(username: string): Promise<string> {
  return adminManager.generateToken(username)
}

export async function verifyAdminToken(token: string): Promise<AdminUser | null> {
  return adminManager.verifyToken(token)
}

export async function getAdminStats(): Promise<AdminStats> {
  return adminManager.getStats()
}

// Cleanup expired sessions every hour
setInterval(
  () => {
    adminManager.cleanupSessions()
  },
  60 * 60 * 1000,
)
