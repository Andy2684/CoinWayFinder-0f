import jwt from "jsonwebtoken"

export interface AdminUser {
  id: string
  username: string
  email: string
  role: "super_admin" | "admin"
  permissions: string[]
  createdAt: Date
  lastLoginAt?: Date
}

export interface AdminSession {
  adminId: string
  username: string
  role: string
  permissions: string[]
  isAdmin: true
}

class AdminManager {
  private static instance: AdminManager
  private adminSecret: string
  private jwtSecret: string

  constructor() {
    this.adminSecret = process.env.ADMIN_SECRET || "admin-secret-key-change-in-production"
    this.jwtSecret = process.env.ADMIN_JWT_SECRET || "admin-jwt-secret-change-in-production"
  }

  static getInstance(): AdminManager {
    if (!AdminManager.instance) {
      AdminManager.instance = new AdminManager()
    }
    return AdminManager.instance
  }

  async authenticateAdmin(username: string, password: string): Promise<AdminUser | null> {
    // Default admin credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME || "admin"
    const adminPassword = process.env.ADMIN_PASSWORD || "CoinWayFinder2024!"
    const adminEmail = process.env.ADMIN_EMAIL || "admin@coinwayfinder.com"

    if (username === adminUsername && password === adminPassword) {
      const admin: AdminUser = {
        id: "admin-001",
        username: adminUsername,
        email: adminEmail,
        role: "super_admin",
        permissions: [
          "view_all_users",
          "manage_users",
          "view_all_bots",
          "manage_bots",
          "view_analytics",
          "manage_subscriptions",
          "system_admin",
          "unlimited_access",
        ],
        createdAt: new Date(),
        lastLoginAt: new Date(),
      }
      return admin
    }

    return null
  }

  generateAdminToken(admin: AdminUser): string {
    const payload: AdminSession = {
      adminId: admin.id,
      username: admin.username,
      role: admin.role,
      permissions: admin.permissions,
      isAdmin: true,
    }

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: "24h",
      issuer: "coinwayfinder-admin",
    })
  }

  verifyAdminToken(token: string): AdminSession | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as AdminSession
      if (decoded.isAdmin) {
        return decoded
      }
      return null
    } catch (error) {
      console.error("Admin token verification failed:", error)
      return null
    }
  }

  hasPermission(admin: AdminSession, permission: string): boolean {
    return admin.permissions.includes(permission) || admin.permissions.includes("unlimited_access")
  }

  bypassSubscriptionCheck(admin: AdminSession): boolean {
    return admin.isAdmin && this.hasPermission(admin, "unlimited_access")
  }

  getAdminStats(): {
    totalUsers: number
    activeBots: number
    totalTrades: number
    systemHealth: string
  } {
    // Mock stats - in real implementation, fetch from database
    return {
      totalUsers: 1247,
      activeBots: 89,
      totalTrades: 15634,
      systemHealth: "operational",
    }
  }
}

export const adminManager = AdminManager.getInstance()

// Middleware to check admin authentication
export function requireAdmin(adminSession: AdminSession | null): boolean {
  return adminSession?.isAdmin === true
}

// Middleware to check specific admin permission
export function requirePermission(adminSession: AdminSession | null, permission: string): boolean {
  if (!adminSession?.isAdmin) return false
  return adminManager.hasPermission(adminSession, permission)
}
