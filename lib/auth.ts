import bcrypt from "bcryptjs"
import { database } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = "7d"
const ADMIN_JWT_EXPIRES_IN = "24h"

export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  createdAt?: Date
  updatedAt?: Date
}

export interface Admin {
  id: string
  username: string
  password?: string
  role: "admin"
  createdAt: Date
  lastLogin?: Date
}

export interface AuthToken {
  userId: string
  email: string
  role: string
  iat: number
  exp: number
}

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  generateAuthToken(user: User): string {
    // Simple token generation without JWT for now
    return Buffer.from(
      JSON.stringify({
        userId: user.id,
        email: user.email,
        role: user.role,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      }),
    ).toString("base64")
  }

  generateAdminToken(admin: Admin): string {
    return Buffer.from(
      JSON.stringify({
        id: admin.id,
        username: admin.username,
        role: admin.role,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      }),
    ).toString("base64")
  }

  async verifyAuthToken(token: string): Promise<User | null> {
    try {
      const decoded = JSON.parse(Buffer.from(token, "base64").toString())

      if (decoded.exp < Date.now()) {
        return null // Token expired
      }

      const user = await database.getUser(decoded.userId)
      if (!user) {
        return null
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: "user",
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      }
    } catch (error) {
      console.error("Token verification error:", error)
      return null
    }
  }

  async verifyAdminToken(token: string): Promise<Admin | null> {
    try {
      const decoded = JSON.parse(Buffer.from(token, "base64").toString())

      if (decoded.exp < Date.now()) {
        return null // Token expired
      }

      // Mock admin verification for now
      if (decoded.username === "admin") {
        return {
          id: decoded.id,
          username: decoded.username,
          role: "admin",
          createdAt: new Date(),
        }
      }

      return null
    } catch (error) {
      console.error("Admin token verification error:", error)
      return null
    }
  }

  async signUp(email: string, username: string, password: string): Promise<{ user: User; token: string }> {
    const existingUser = await database.getUserByEmail(email)
    if (existingUser) {
      throw new Error("User already exists with this email")
    }

    const hashedPassword = await this.hashPassword(password)
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newUser = await database.createUser({
      id: userId,
      email,
      name: username,
      raw_json: { password: hashedPassword, role: "user" },
    })

    const user: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: "user",
      createdAt: newUser.created_at,
      updatedAt: newUser.updated_at,
    }

    const token = this.generateAuthToken(user)
    return { user, token }
  }

  async signIn(emailOrUsername: string, password: string): Promise<{ user: User; token: string }> {
    const user = await database.getUserByEmail(emailOrUsername)
    if (!user || !user.raw_json?.password) {
      throw new Error("Invalid credentials")
    }

    const isValidPassword = await this.comparePassword(password, user.raw_json.password)
    if (!isValidPassword) {
      throw new Error("Invalid credentials")
    }

    const userResponse: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: "user",
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }

    const token = this.generateAuthToken(userResponse)
    return { user: userResponse, token }
  }

  async adminSignIn(username: string, password: string): Promise<{ admin: Admin; token: string }> {
    // Mock admin login for now
    if (username === "admin" && password === "CoinWayFinder2024!") {
      const admin: Admin = {
        id: "admin_1",
        username: "admin",
        role: "admin",
        createdAt: new Date(),
        lastLogin: new Date(),
      }

      const token = this.generateAdminToken(admin)
      return { admin, token }
    }

    throw new Error("Invalid admin credentials")
  }

  async getUserById(userId: string): Promise<User | null> {
    const user = await database.getUser(userId)
    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: "user",
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const updatedUser = await database.updateUser(userId, {
      email: updates.email,
      name: updates.name,
    })

    if (!updatedUser) return null

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: "user",
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at,
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await database.getUser(userId)
    if (!user || !user.raw_json?.password) {
      throw new Error("User not found")
    }

    const isValidPassword = await this.comparePassword(currentPassword, user.raw_json.password)
    if (!isValidPassword) {
      throw new Error("Current password is incorrect")
    }

    const hashedNewPassword = await this.hashPassword(newPassword)
    const updatedUser = await database.updateUser(userId, {
      raw_json: { ...user.raw_json, password: hashedNewPassword },
    })

    return !!updatedUser
  }

  async deactivateUser(userId: string): Promise<boolean> {
    return await database.deleteUser(userId)
  }

  async createDefaultAdmin(): Promise<void> {
    // Mock implementation - admin is hardcoded for now
    console.log("Default admin available: admin / CoinWayFinder2024!")
  }
}

export class AuthManager {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  async initialize(): Promise<void> {
    await this.authService.createDefaultAdmin()
  }

  getAuthService(): AuthService {
    return this.authService
  }

  async authenticateUser(token: string): Promise<User | null> {
    return this.authService.verifyAuthToken(token)
  }

  async authenticateAdmin(token: string): Promise<Admin | null> {
    return this.authService.verifyAdminToken(token)
  }

  async registerUser(email: string, username: string, password: string): Promise<{ user: User; token: string }> {
    return this.authService.signUp(email, username, password)
  }

  async loginUser(emailOrUsername: string, password: string): Promise<{ user: User; token: string }> {
    return this.authService.signIn(emailOrUsername, password)
  }

  async loginAdmin(username: string, password: string): Promise<{ admin: Admin; token: string }> {
    return this.authService.adminSignIn(username, password)
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  return authHeader.substring(7)
}

export function verifyToken(token: string): AuthToken | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())
    if (decoded.exp < Date.now()) {
      return null
    }
    return decoded as AuthToken
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export function isAdmin(user: AuthToken): boolean {
  return user.role === "admin"
}

export function generateRefreshToken(userId: string): string {
  return Buffer.from(
    JSON.stringify({
      userId,
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    }),
  ).toString("base64")
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())
    if (decoded.exp < Date.now()) {
      return null
    }
    return { userId: decoded.userId }
  } catch (error) {
    console.error("Refresh token verification failed:", error)
    return null
  }
}

// Export instances
export const authService = new AuthService()
export const authManager = new AuthManager()

// Initialize on module load
authManager.initialize().catch(console.error)
