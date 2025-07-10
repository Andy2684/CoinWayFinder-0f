import { simpleHash } from "./security"
import { database } from "./database"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = "7d"
const ADMIN_JWT_EXPIRES_IN = "24h"

export interface User {
  id: string
  email: string
  username: string
  password?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  subscription?: {
    plan: string
    status: string
    trialEndsAt?: Date
    currentPeriodEnd?: Date
  }
}

export interface Admin {
  id: string
  username: string
  password?: string
  role: "admin"
  createdAt: Date
  lastLogin?: Date
}

// Simple JWT implementation without crypto dependency
function createJWT(payload: any, secret: string, expiresIn: string): string {
  const header = { alg: "HS256", typ: "JWT" }
  const now = Math.floor(Date.now() / 1000)
  const exp = now + (expiresIn === "7d" ? 7 * 24 * 60 * 60 : 24 * 60 * 60)

  const jwtPayload = { ...payload, iat: now, exp }

  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(jwtPayload))
  const signature = simpleHash(`${encodedHeader}.${encodedPayload}.${secret}`)

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

function verifyJWT(token: string, secret: string): any {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split(".")
    const expectedSignature = simpleHash(`${encodedHeader}.${encodedPayload}.${secret}`)

    if (signature !== expectedSignature) {
      throw new Error("Invalid signature")
    }

    const payload = JSON.parse(atob(encodedPayload))

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error("Token expired")
    }

    return payload
  } catch (error) {
    throw new Error("Invalid token")
  }
}

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    // Simple password hashing - in production, use bcrypt
    return simpleHash(password + "salt")
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password)
    return hashedInput === hashedPassword
  }

  generateAuthToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
      isActive: user.isActive,
    }
    return createJWT(payload, JWT_SECRET, JWT_EXPIRES_IN)
  }

  generateAdminToken(admin: Admin): string {
    const payload = {
      id: admin.id,
      username: admin.username,
      role: admin.role,
    }
    return createJWT(payload, JWT_SECRET, ADMIN_JWT_EXPIRES_IN)
  }

  async verifyAuthToken(token: string): Promise<User | null> {
    try {
      const decoded = verifyJWT(token, JWT_SECRET)
      const user = await database.getUserById(decoded.id)

      if (!user || !user.isActive) {
        return null
      }

      return user
    } catch (error) {
      console.error("Token verification error:", error)
      return null
    }
  }

  async verifyAdminToken(token: string): Promise<Admin | null> {
    try {
      const decoded = verifyJWT(token, JWT_SECRET)

      // Mock admin verification - implement with your database
      if (decoded.role === "admin") {
        return {
          id: decoded.id,
          username: decoded.username,
          role: decoded.role,
          createdAt: new Date(),
        }
      }

      return null
    } catch (error) {
      console.error("Admin token verification error:", error)
      return null
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const cookieStore = cookies()
      const token = cookieStore.get("auth-token")?.value

      if (!token) {
        return null
      }

      return await this.verifyAuthToken(token)
    } catch (error) {
      console.error("Get current user error:", error)
      return null
    }
  }

  async getCurrentAdmin(): Promise<Admin | null> {
    try {
      const cookieStore = cookies()
      const token = cookieStore.get("admin-token")?.value

      if (!token) {
        return null
      }

      return await this.verifyAdminToken(token)
    } catch (error) {
      console.error("Get current admin error:", error)
      return null
    }
  }

  async signUp(email: string, username: string, password: string): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await database.getUserByEmail(email)

    if (existingUser) {
      throw new Error("User already exists with this email or username")
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password)

    // Create user
    const newUser = await database.createUser({
      email,
      username,
      password: hashedPassword,
      isActive: true,
      subscription: {
        plan: "free",
        status: "active",
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
      },
    })

    const token = this.generateAuthToken(newUser)

    return { user: newUser, token }
  }

  async signIn(emailOrUsername: string, password: string): Promise<{ user: User; token: string }> {
    // Find user by email
    const user = await database.getUserByEmail(emailOrUsername)

    if (!user || !user.isActive) {
      throw new Error("Invalid credentials")
    }

    // Verify password
    const isValidPassword = await this.comparePassword(password, user.password!)
    if (!isValidPassword) {
      throw new Error("Invalid credentials")
    }

    // Update user
    await database.updateUser(user.id, { updatedAt: new Date() })

    const token = this.generateAuthToken(user)

    return { user, token }
  }

  async adminSignIn(username: string, password: string): Promise<{ admin: Admin; token: string }> {
    // Mock admin authentication - implement with your database
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
    return await database.getUserById(userId)
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    return await database.updateUser(userId, updates)
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await database.getUserById(userId)
    if (!user) {
      throw new Error("User not found")
    }

    // Verify current password
    const isValidPassword = await this.comparePassword(currentPassword, user.password!)
    if (!isValidPassword) {
      throw new Error("Current password is incorrect")
    }

    // Hash new password
    const hashedNewPassword = await this.hashPassword(newPassword)

    // Update password
    await database.updateUser(userId, { password: hashedNewPassword })

    return true
  }

  async deactivateUser(userId: string): Promise<boolean> {
    await database.updateUser(userId, { isActive: false })
    return true
  }

  async createDefaultAdmin(): Promise<void> {
    // Default admin is handled in adminSignIn method
    console.log("Default admin available: admin / CoinWayFinder2024!")
  }

  async signOut(): Promise<void> {
    // In a real implementation, you might want to invalidate the token
    // For now, we'll just rely on the client removing the cookie
    console.log("User signed out")
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

// Export instances
export const authService = new AuthService()
export const authManager = new AuthManager()

// Static methods for easier access
export const AuthUtils = {
  getCurrentUser: async (): Promise<User | null> => {
    return await authService.getCurrentUser()
  },
  getCurrentAdmin: async (): Promise<Admin | null> => {
    return await authService.getCurrentAdmin()
  },
  verifyAuthToken: async (token: string): Promise<User | null> => {
    return await authService.verifyAuthToken(token)
  },
  verifyAdminToken: async (token: string): Promise<Admin | null> => {
    return await authService.verifyAdminToken(token)
  },
}

// Initialize on module load
authManager.initialize().catch(console.error)
