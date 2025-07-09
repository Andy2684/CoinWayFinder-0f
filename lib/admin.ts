import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin-super-secret-key-2024"
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin-jwt-secret-key-2024"

// Admin credentials - change these in production
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || "admin",
  password: process.env.ADMIN_PASSWORD || "CoinWayFinder2024!",
  email: process.env.ADMIN_EMAIL || "admin@coinwayfinder.com",
}

export interface AdminUser {
  id: string
  username: string
  email: string
  role: "admin"
  permissions: string[]
}

export class AdminService {
  static async verifyAdminPassword(password: string): Promise<boolean> {
    // In production, you should hash the admin password
    return password === ADMIN_CREDENTIALS.password
  }

  static generateAdminToken(admin: AdminUser): string {
    return jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isAdmin: true,
      },
      ADMIN_JWT_SECRET,
      { expiresIn: "30d" }, // Longer expiry for admin
    )
  }

  static verifyAdminToken(token: string): AdminUser | null {
    try {
      const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as any
      if (!decoded.isAdmin) return null

      return {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions,
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
      maxAge: 30 * 24 * 60 * 60, // 30 days
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

  static async adminSignIn(
    username: string,
    password: string,
  ): Promise<{ success: boolean; message: string; admin?: AdminUser }> {
    try {
      // Check credentials
      if (username !== ADMIN_CREDENTIALS.username) {
        return { success: false, message: "Invalid admin credentials" }
      }

      const isValidPassword = await this.verifyAdminPassword(password)
      if (!isValidPassword) {
        return { success: false, message: "Invalid admin credentials" }
      }

      const admin: AdminUser = {
        id: "admin-001",
        username: ADMIN_CREDENTIALS.username,
        email: ADMIN_CREDENTIALS.email,
        role: "admin",
        permissions: [
          "all_features",
          "unlimited_bots",
          "unlimited_trades",
          "ai_features",
          "user_management",
          "subscription_management",
          "system_monitoring",
        ],
      }

      await this.setAdminCookie(admin)

      return { success: true, message: "Admin signed in successfully", admin }
    } catch (error) {
      console.error("Admin sign in error:", error)
      return { success: false, message: "Failed to sign in as admin" }
    }
  }

  static async adminSignOut(): Promise<void> {
    await this.clearAdminCookie()
  }

  static async requireAdmin(): Promise<AdminUser> {
    const admin = await this.getCurrentAdmin()
    if (!admin) {
      throw new Error("Admin authentication required")
    }
    return admin
  }

  static async isAdmin(): Promise<boolean> {
    const admin = await this.getCurrentAdmin()
    return admin !== null
  }

  // Check if current user has admin privileges (bypasses all restrictions)
  static async hasAdminPrivileges(): Promise<boolean> {
    return await this.isAdmin()
  }
}
