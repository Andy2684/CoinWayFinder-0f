import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const ADMIN_JWT_EXPIRES_IN = "4h"

export interface AdminUser {
  id: string
  username: string
  email?: string
  role: "admin" | "super_admin"
  permissions: string[]
  isActive: boolean
  createdAt: Date
  lastLogin?: Date
}

export interface AdminCredentials {
  username: string
  password: string
}

export class AdminManager {
  private db: any

  constructor() {
    this.initializeDatabase()
  }

  private async initializeDatabase() {
    this.db = await connectToDatabase()
    await this.createDefaultAdmin()
  }

  private async createDefaultAdmin() {
    try {
      const existingAdmin = await this.db.collection("admins").findOne({ username: "admin" })
      if (existingAdmin) return

      const hashedPassword = await bcrypt.hash("CoinWayFinder2024!", 12)
      const adminId = new Date().getTime().toString()

      const defaultAdmin = {
        _id: adminId,
        username: "admin",
        email: "admin@coinwayfinder.com",
        password: hashedPassword,
        role: "super_admin",
        permissions: ["*"],
        isActive: true,
        createdAt: new Date(),
      }

      await this.db.collection("admins").insertOne(defaultAdmin)
      console.log("Default admin created: admin / CoinWayFinder2024!")
    } catch (error) {
      console.error("Error creating default admin:", error)
    }
  }

  async validateCredentials(username: string, password: string): Promise<AdminUser | null> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const admin = await this.db.collection("admins").findOne({
        username,
        isActive: true,
      })

      if (!admin) return null

      const isValidPassword = await bcrypt.compare(password, admin.password)
      if (!isValidPassword) return null

      // Update last login
      await this.db.collection("admins").updateOne({ _id: admin._id }, { $set: { lastLogin: new Date() } })

      return {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        lastLogin: new Date(),
      }
    } catch (error) {
      console.error("Error validating admin credentials:", error)
      return null
    }
  }

  generateToken(admin: AdminUser): string {
    const payload = {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      permissions: admin.permissions,
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ADMIN_JWT_EXPIRES_IN })
  }

  async getAdminById(adminId: string): Promise<AdminUser | null> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const admin = await this.db.collection("admins").findOne({
        _id: adminId,
        isActive: true,
      })

      if (!admin) return null

      return {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin,
      }
    } catch (error) {
      console.error("Error getting admin by ID:", error)
      return null
    }
  }

  async getAllAdmins(): Promise<AdminUser[]> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const admins = await this.db.collection("admins").find({ isActive: true }).toArray()
      return admins.map((admin: any) => ({
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin,
      }))
    } catch (error) {
      console.error("Error getting all admins:", error)
      return []
    }
  }

  async createAdmin(adminData: {
    username: string
    email?: string
    password: string
    role: "admin" | "super_admin"
    permissions: string[]
  }): Promise<AdminUser | null> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      // Check if admin already exists
      const existingAdmin = await this.db.collection("admins").findOne({
        $or: [{ username: adminData.username }, { email: adminData.email }],
      })

      if (existingAdmin) {
        throw new Error("Admin with this username or email already exists")
      }

      const hashedPassword = await bcrypt.hash(adminData.password, 12)
      const adminId = new Date().getTime().toString()

      const newAdmin = {
        _id: adminId,
        username: adminData.username,
        email: adminData.email,
        password: hashedPassword,
        role: adminData.role,
        permissions: adminData.permissions,
        isActive: true,
        createdAt: new Date(),
      }

      await this.db.collection("admins").insertOne(newAdmin)

      return {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
        permissions: newAdmin.permissions,
        isActive: newAdmin.isActive,
        createdAt: newAdmin.createdAt,
      }
    } catch (error) {
      console.error("Error creating admin:", error)
      return null
    }
  }

  async updateAdmin(adminId: string, updates: Partial<AdminUser>): Promise<boolean> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const updateData = { ...updates }
      delete updateData.id
      delete updateData.createdAt

      const result = await this.db
        .collection("admins")
        .updateOne({ _id: adminId }, { $set: { ...updateData, updatedAt: new Date() } })

      return result.modifiedCount > 0
    } catch (error) {
      console.error("Error updating admin:", error)
      return false
    }
  }

  async deactivateAdmin(adminId: string): Promise<boolean> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const result = await this.db
        .collection("admins")
        .updateOne({ _id: adminId }, { $set: { isActive: false, updatedAt: new Date() } })

      return result.modifiedCount > 0
    } catch (error) {
      console.error("Error deactivating admin:", error)
      return false
    }
  }

  async changePassword(adminId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const admin = await this.db.collection("admins").findOne({ _id: adminId })
      if (!admin) return false

      const isValidPassword = await bcrypt.compare(currentPassword, admin.password)
      if (!isValidPassword) return false

      const hashedNewPassword = await bcrypt.hash(newPassword, 12)

      const result = await this.db
        .collection("admins")
        .updateOne({ _id: adminId }, { $set: { password: hashedNewPassword, updatedAt: new Date() } })

      return result.modifiedCount > 0
    } catch (error) {
      console.error("Error changing admin password:", error)
      return false
    }
  }

  hasPermission(admin: AdminUser, permission: string): boolean {
    if (admin.permissions.includes("*")) return true
    return admin.permissions.includes(permission)
  }

  async getSystemStats(): Promise<any> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const [totalUsers, totalBots, totalTrades, activeUsers] = await Promise.all([
        this.db.collection("users").countDocuments({ isActive: true }),
        this.db.collection("bots").countDocuments(),
        this.db.collection("trades").countDocuments(),
        this.db.collection("users").countDocuments({
          isActive: true,
          lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }),
      ])

      return {
        totalUsers,
        totalBots,
        totalTrades,
        activeUsers,
        timestamp: new Date(),
      }
    } catch (error) {
      console.error("Error getting system stats:", error)
      return {
        totalUsers: 0,
        totalBots: 0,
        totalTrades: 0,
        activeUsers: 0,
        timestamp: new Date(),
      }
    }
  }
}

export const adminManager = new AdminManager()

// Named export for verifyAdminToken
export async function verifyAdminToken(token: string): Promise<AdminUser | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const admin = await adminManager.getAdminById(decoded.id)

    if (!admin || !admin.isActive) {
      return null
    }

    return admin
  } catch (error) {
    console.error("Error verifying admin token:", error)
    return null
  }
}

// Additional admin service functions
export class AdminService {
  static async validateAdminCredentials(username: string, password: string): Promise<AdminUser | null> {
    return adminManager.validateCredentials(username, password)
  }

  static async setAdminCookie(admin: AdminUser): Promise<void> {
    // This would be handled by the API route
    console.log("Admin cookie set for:", admin.username)
  }

  static async clearAdminCookie(): Promise<void> {
    // This would be handled by the API route
    console.log("Admin cookie cleared")
  }

  static async getCurrentAdmin(): Promise<AdminUser | null> {
    // This would get the current admin from the request context
    return null
  }
}
