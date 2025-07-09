import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { database } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "CoinWayFinder2024!"

export interface User {
  id: string
  email: string
  username: string
  isActive: boolean
  createdAt: Date
  lastLoginAt?: Date
}

export interface AuthResult {
  success: boolean
  user?: User
  token?: string
  message?: string
}

export interface AdminUser {
  id: string
  username: string
  role: "admin"
}

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  generateToken(payload: any): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return null
    }
  }

  async register(email: string, username: string, password: string): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await database.getUserByEmail(email)
      if (existingUser) {
        return { success: false, message: "User already exists" }
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password)

      // Create user
      const user = await database.createUser({
        email,
        username,
        password: hashedPassword,
        createdAt: new Date(),
        isActive: true,
      })

      // Create user settings with trial
      await database.createUserWithTrial(user._id!.toString())

      // Generate token
      const token = this.generateToken({
        userId: user._id!.toString(),
        email: user.email,
        username: user.username,
      })

      // Set cookie
      const cookieStore = await cookies()
      cookieStore.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })

      return {
        success: true,
        user: {
          id: user._id!.toString(),
          email: user.email,
          username: user.username,
          isActive: user.isActive!,
          createdAt: user.createdAt,
        },
        token,
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, message: "Registration failed" }
    }
  }

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Find user
      const user = await database.getUserByEmail(email)
      if (!user) {
        return { success: false, message: "Invalid credentials" }
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.password)
      if (!isValidPassword) {
        return { success: false, message: "Invalid credentials" }
      }

      // Update last login
      await database.updateUser(user._id!.toString(), { lastLoginAt: new Date() })

      // Generate token
      const token = this.generateToken({
        userId: user._id!.toString(),
        email: user.email,
        username: user.username,
      })

      // Set cookie
      const cookieStore = await cookies()
      cookieStore.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })

      return {
        success: true,
        user: {
          id: user._id!.toString(),
          email: user.email,
          username: user.username,
          isActive: user.isActive!,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        },
        token,
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "Login failed" }
    }
  }

  async logout(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete("auth-token")
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get("auth-token")?.value

      if (!token) {
        return null
      }

      const payload = this.verifyToken(token)
      if (!payload) {
        return null
      }

      const user = await database.getUserById(payload.userId)
      if (!user) {
        return null
      }

      return {
        id: user._id!.toString(),
        email: user.email,
        username: user.username,
        isActive: user.isActive!,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      }
    } catch (error) {
      console.error("Get current user error:", error)
      return null
    }
  }

  async adminLogin(
    username: string,
    password: string,
  ): Promise<{ success: boolean; user?: AdminUser; token?: string; message?: string }> {
    try {
      if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        return { success: false, message: "Invalid admin credentials" }
      }

      const token = this.generateToken({
        userId: "admin",
        username: ADMIN_USERNAME,
        role: "admin",
      })

      // Set admin cookie
      const cookieStore = await cookies()
      cookieStore.set("admin-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
      })

      return {
        success: true,
        user: {
          id: "admin",
          username: ADMIN_USERNAME,
          role: "admin",
        },
        token,
      }
    } catch (error) {
      console.error("Admin login error:", error)
      return { success: false, message: "Admin login failed" }
    }
  }

  async adminLogout(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete("admin-token")
  }

  async getCurrentAdmin(): Promise<AdminUser | null> {
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get("admin-token")?.value

      if (!token) {
        return null
      }

      const payload = this.verifyToken(token)
      if (!payload || payload.role !== "admin") {
        return null
      }

      return {
        id: "admin",
        username: ADMIN_USERNAME,
        role: "admin",
      }
    } catch (error) {
      console.error("Get current admin error:", error)
      return null
    }
  }

  async verifyAuthToken(token: string): Promise<User | null> {
    try {
      const payload = this.verifyToken(token)
      if (!payload) {
        return null
      }

      const user = await database.getUserById(payload.userId)
      if (!user) {
        return null
      }

      return {
        id: user._id!.toString(),
        email: user.email,
        username: user.username,
        isActive: user.isActive!,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      }
    } catch (error) {
      console.error("Verify auth token error:", error)
      return null
    }
  }

  async verifyAdminToken(token: string): Promise<AdminUser | null> {
    try {
      const payload = this.verifyToken(token)
      if (!payload || payload.role !== "admin") {
        return null
      }

      return {
        id: "admin",
        username: ADMIN_USERNAME,
        role: "admin",
      }
    } catch (error) {
      console.error("Verify admin token error:", error)
      return null
    }
  }
}

export class AuthManager {
  private authService = new AuthService()

  async register(email: string, username: string, password: string): Promise<AuthResult> {
    return this.authService.register(email, username, password)
  }

  async login(email: string, password: string): Promise<AuthResult> {
    return this.authService.login(email, password)
  }

  async logout(): Promise<void> {
    return this.authService.logout()
  }

  async getCurrentUser(): Promise<User | null> {
    return this.authService.getCurrentUser()
  }

  async adminLogin(
    username: string,
    password: string,
  ): Promise<{ success: boolean; user?: AdminUser; token?: string; message?: string }> {
    return this.authService.adminLogin(username, password)
  }

  async adminLogout(): Promise<void> {
    return this.authService.adminLogout()
  }

  async getCurrentAdmin(): Promise<AdminUser | null> {
    return this.authService.getCurrentAdmin()
  }

  async verifyAuthToken(token: string): Promise<User | null> {
    return this.authService.verifyAuthToken(token)
  }

  async verifyAdminToken(token: string): Promise<AdminUser | null> {
    return this.authService.verifyAdminToken(token)
  }
}

// Create instances for export
export const authService = new AuthService()
export const authManager = new AuthManager()

// Legacy exports for backward compatibility
export const hashPassword = (password: string) => authService.hashPassword(password)
export const comparePassword = (password: string, hashedPassword: string) =>
  authService.verifyPassword(password, hashedPassword)
export const generateToken = (payload: any) => authService.generateToken(payload)
export const verifyToken = (token: string) => authService.verifyToken(token)
export const getCurrentUser = () => authService.getCurrentUser()
export const requireAuth = async () => {
  const user = await authService.getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}
export const signUp = (email: string, username: string, password: string) =>
  authService.register(email, username, password)
export const signIn = (email: string, password: string) => authService.login(email, password)
export const signOut = () => authService.logout()
