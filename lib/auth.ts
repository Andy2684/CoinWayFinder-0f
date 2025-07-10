import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = "7d"
const ADMIN_JWT_EXPIRES_IN = "24h"

export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  subscriptionTier: "free" | "starter" | "pro" | "enterprise"
  subscriptionStatus: "active" | "inactive" | "trial"
  trialEndsAt?: Date
  createdAt: Date
  updatedAt: Date
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
  subscriptionTier: string
  iat: number
  exp: number
}

export class AuthService {
  private db: any

  constructor() {
    this.initializeDatabase()
  }

  private async initializeDatabase() {
    this.db = await connectToDatabase()
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  generateAuthToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    )
  }

  generateAdminToken(admin: Admin): string {
    const payload = {
      id: admin.id,
      username: admin.username,
      role: admin.role,
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ADMIN_JWT_EXPIRES_IN })
  }

  async verifyAuthToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any

      if (!this.db) {
        await this.initializeDatabase()
      }

      const user = await this.db.collection("users").findOne({
        _id: decoded.userId,
        isActive: true,
      })

      if (!user) {
        return null
      }

      return {
        id: user._id,
        email: user.email,
        name: user.username,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        trialEndsAt: user.trialEndsAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    } catch (error) {
      console.error("Token verification error:", error)
      return null
    }
  }

  async verifyAdminToken(token: string): Promise<Admin | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any

      if (!this.db) {
        await this.initializeDatabase()
      }

      const admin = await this.db.collection("admins").findOne({
        _id: decoded.id,
        role: "admin",
      })

      if (!admin) {
        return null
      }

      return {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin,
      }
    } catch (error) {
      console.error("Admin token verification error:", error)
      return null
    }
  }

  async signUp(email: string, username: string, password: string): Promise<{ user: User; token: string }> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    const existingUser = await this.db.collection("users").findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      throw new Error("User already exists with this email or username")
    }

    const hashedPassword = await this.hashPassword(password)
    const userId = new Date().getTime().toString()
    const newUser = {
      _id: userId,
      email,
      username,
      password: hashedPassword,
      role: "user",
      subscriptionTier: "free",
      subscriptionStatus: "active",
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await this.db.collection("users").insertOne(newUser)

    const user: User = {
      id: newUser._id,
      email: newUser.email,
      name: newUser.username,
      role: newUser.role,
      subscriptionTier: newUser.subscriptionTier,
      subscriptionStatus: newUser.subscriptionStatus,
      trialEndsAt: newUser.trialEndsAt,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    }

    const token = this.generateAuthToken(user)
    return { user, token }
  }

  async signIn(emailOrUsername: string, password: string): Promise<{ user: User; token: string }> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    const user = await this.db.collection("users").findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
      isActive: true,
    })

    if (!user) {
      throw new Error("Invalid credentials")
    }

    const isValidPassword = await this.comparePassword(password, user.password)
    if (!isValidPassword) {
      throw new Error("Invalid credentials")
    }

    await this.db
      .collection("users")
      .updateOne({ _id: user._id }, { $set: { lastLogin: new Date(), updatedAt: new Date() } })

    const userResponse: User = {
      id: user._id,
      email: user.email,
      name: user.username,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      trialEndsAt: user.trialEndsAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    const token = this.generateAuthToken(userResponse)
    return { user: userResponse, token }
  }

  async adminSignIn(username: string, password: string): Promise<{ admin: Admin; token: string }> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    const admin = await this.db.collection("admins").findOne({
      username,
      role: "admin",
    })

    if (!admin) {
      throw new Error("Invalid admin credentials")
    }

    const isValidPassword = await this.comparePassword(password, admin.password)
    if (!isValidPassword) {
      throw new Error("Invalid admin credentials")
    }

    await this.db.collection("admins").updateOne({ _id: admin._id }, { $set: { lastLogin: new Date() } })

    const adminResponse: Admin = {
      id: admin._id,
      username: admin.username,
      role: admin.role,
      createdAt: admin.createdAt,
      lastLogin: new Date(),
    }

    const token = this.generateAdminToken(adminResponse)
    return { admin: adminResponse, token }
  }

  async getUserById(userId: string): Promise<User | null> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    const user = await this.db.collection("users").findOne({
      _id: userId,
      isActive: true,
    })

    if (!user) {
      return null
    }

    return {
      id: user._id,
      email: user.email,
      name: user.username,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      trialEndsAt: user.trialEndsAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    const updateData = {
      ...updates,
      updatedAt: new Date(),
    }

    delete updateData.id
    delete updateData.password

    await this.db.collection("users").updateOne({ _id: userId }, { $set: updateData })
    return this.getUserById(userId)
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    const user = await this.db.collection("users").findOne({ _id: userId })
    if (!user) {
      throw new Error("User not found")
    }

    const isValidPassword = await this.comparePassword(currentPassword, user.password)
    if (!isValidPassword) {
      throw new Error("Current password is incorrect")
    }

    const hashedNewPassword = await this.hashPassword(newPassword)

    await this.db
      .collection("users")
      .updateOne({ _id: userId }, { $set: { password: hashedNewPassword, updatedAt: new Date() } })

    return true
  }

  async deactivateUser(userId: string): Promise<boolean> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    await this.db.collection("users").updateOne({ _id: userId }, { $set: { isActive: false, updatedAt: new Date() } })
    return true
  }

  async createDefaultAdmin(): Promise<void> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    const existingAdmin = await this.db.collection("admins").findOne({ username: "admin" })
    if (existingAdmin) {
      return
    }

    const hashedPassword = await this.hashPassword("CoinWayFinder2024!")
    const adminId = new Date().getTime().toString()

    const defaultAdmin = {
      _id: adminId,
      username: "admin",
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
    }

    await this.db.collection("admins").insertOne(defaultAdmin)
    console.log("Default admin created: admin / CoinWayFinder2024!")
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

// This is the missing export that was causing the deployment error
export async function verifyToken(token: string): Promise<User | null> {
  return authService.verifyAuthToken(token)
}

export function verifyTokenSync(token: string): AuthToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthToken
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export function getCurrentUser(request: Request): AuthToken | null {
  const authHeader = request.headers.get("authorization")
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return null
  }

  return verifyTokenSync(token)
}

// Export instances
export const authService = new AuthService()
export const authManager = new AuthManager()

// Initialize on module load
authManager.initialize().catch(console.error)
