import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export interface Admin {
  id: string
  username: string
  email: string
  role: string
  createdAt: string
}

export interface AdminSession {
  adminId: string
  username: string
  email: string
  role: string
  token: string
  expiresAt: number
}

export interface AdminCredentials {
  username: string
  password: string
}

// Mock admin data - in production, this would be in a database
const ADMIN_USERS = [
  {
    id: "admin-1",
    username: "admin",
    email: "admin@coinwayfinder.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJK9fHPyG", // CoinWayFinder2024!
    role: "admin",
    createdAt: new Date().toISOString(),
  },
]

export class AdminService {
  private static adminSessions = new Map<string, AdminSession>()

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateAdminToken(admin: Admin): string {
    return jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )
  }

  static verifyAdminToken(token: string): AdminSession | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      return {
        adminId: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        token,
        expiresAt: decoded.exp * 1000,
      }
    } catch (error) {
      return null
    }
  }

  static async validateAdminCredentials(username: string, password: string): Promise<Admin | null> {
    const admin = ADMIN_USERS.find((a) => a.username === username)
    if (!admin) {
      return null
    }

    const isValidPassword = await this.comparePassword(password, admin.password)
    if (!isValidPassword) {
      return null
    }

    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
    }
  }

  static async setAdminCookie(admin: Admin): Promise<void> {
    const token = this.generateAdminToken(admin)
    const cookieStore = await cookies()

    // Store session
    const session: AdminSession = {
      adminId: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }

    this.adminSessions.set(token, session)

    cookieStore.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
}

export class AdminManager {
  async signIn(username: string, password: string): Promise<{ success: boolean; message: string; admin?: Admin }> {
    try {
      const admin = await AdminService.validateAdminCredentials(username, password)
      if (!admin) {
        return { success: false, message: "Invalid credentials" }
      }

      await AdminService.setAdminCookie(admin)
      return { success: true, message: "Admin signed in successfully", admin }
    } catch (error) {
      console.error("Admin sign in error:", error)
      return { success: false, message: "Failed to sign in" }
    }
  }

  async signOut(): Promise<void> {
    await AdminService.clearAdminCookie()
  }

  async getCurrentAdmin(): Promise<AdminSession | null> {
    return AdminService.getCurrentAdmin()
  }

  async requireAdmin(): Promise<AdminSession> {
    return AdminService.requireAdmin()
  }
}

export const adminManager = new AdminManager()

// Export functions for backward compatibility
export const validateAdminCredentials = AdminService.validateAdminCredentials
export const generateAdminToken = AdminService.generateAdminToken
export const verifyAdminToken = AdminService.verifyAdminToken
export const getCurrentAdmin = AdminService.getCurrentAdmin
export const requireAdmin = AdminService.requireAdmin
