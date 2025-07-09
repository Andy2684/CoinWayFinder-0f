import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "CoinWayFinder2024!",
  email: "project.command.center@gmail.com",
  role: "admin",
}

export interface AdminUser {
  username: string
  email: string
  role: string
}

export async function validateAdminCredentials(username: string, password: string): Promise<AdminUser | null> {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    return {
      username: ADMIN_CREDENTIALS.username,
      email: ADMIN_CREDENTIALS.email,
      role: ADMIN_CREDENTIALS.role,
    }
  }
  return null
}

export function generateAdminToken(admin: AdminUser): string {
  return jwt.sign(
    {
      username: admin.username,
      email: admin.email,
      role: admin.role,
      isAdmin: true,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  )
}

export function verifyAdminToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.isAdmin && decoded.role === "admin") {
      return {
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
      }
    }
    return null
  } catch (error) {
    return null
  }
}

export function isAdminUser(email: string): boolean {
  return email === ADMIN_CREDENTIALS.email
}

// Admin privileges - bypass all subscription checks
export function hasAdminPrivileges(userEmail?: string): boolean {
  return userEmail === ADMIN_CREDENTIALS.email
}

// Get admin system stats
export function getAdminStats() {
  return {
    totalUsers: 15420,
    activeBots: 3847,
    totalTrades: 89234,
    newsArticles: 1247,
    whaleTransactions: 234,
    systemUptime: "99.9%",
    lastUpdated: new Date().toISOString(),
  }
}
