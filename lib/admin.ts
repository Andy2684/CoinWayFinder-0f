import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Admin credentials - hardcoded for backdoor access
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "CoinWayFinder2024!", // This will be hashed
  email: "project.command.center@gmail.com",
  role: "admin",
}

// Hash the admin password
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_CREDENTIALS.password, 10)

export interface AdminUser {
  id: string
  username: string
  email: string
  role: "admin"
  permissions: string[]
}

export class AdminAuth {
  static async authenticate(username: string, password: string): Promise<AdminUser | null> {
    if (username === ADMIN_CREDENTIALS.username) {
      const isValid = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)
      if (isValid) {
        return {
          id: "admin-1",
          username: ADMIN_CREDENTIALS.username,
          email: ADMIN_CREDENTIALS.email,
          role: "admin",
          permissions: [
            "unlimited_bots",
            "unlimited_trades",
            "premium_features",
            "user_management",
            "system_stats",
            "whale_tracking",
            "news_access",
          ],
        }
      }
    }
    return null
  }

  static generateToken(admin: AdminUser): string {
    return jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )
  }

  static verifyToken(token: string): AdminUser | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      return {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || [],
      }
    } catch {
      return null
    }
  }

  static hasPermission(admin: AdminUser, permission: string): boolean {
    return admin.permissions.includes(permission) || admin.role === "admin"
  }
}

// Admin bypass for subscription checks
export function isAdminUser(userId: string): boolean {
  return userId === "admin-1"
}

// Admin system stats
export async function getSystemStats() {
  // Mock data - replace with real database queries
  return {
    totalUsers: 1247,
    activeUsers: 892,
    totalBots: 3456,
    activeBots: 2134,
    totalTrades: 15678,
    todayTrades: 234,
    newsArticles: 1892,
    whaleTransactions: 45,
    systemUptime: "99.9%",
    lastUpdated: new Date().toISOString(),
  }
}
