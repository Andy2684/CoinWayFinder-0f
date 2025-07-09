import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: string
  email: string
  username: string
  hashedPassword: string
  subscription: {
    plan: "free" | "starter" | "pro" | "enterprise"
    status: "active" | "inactive" | "trial" | "cancelled"
    expiresAt?: Date
    trialEndsAt?: Date
  }
  createdAt: Date
  lastActive: Date
}

export interface AuthToken {
  userId: string
  email: string
  username: string
  subscription: User["subscription"]
}

export class AuthService {
  private sessions: Map<string, { userId: string; expiresAt: Date }> = new Map()

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  async createUser(email: string, username: string, password: string): Promise<User> {
    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      throw new Error("User already exists")
    }

    const hashedPassword = await this.hashPassword(password)
    const now = new Date()

    const user: Omit<User, "id"> = {
      email,
      username,
      hashedPassword,
      subscription: {
        plan: "free",
        status: "trial",
        trialEndsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
      },
      createdAt: now,
      lastActive: now,
    }

    const result = await db.collection("users").insertOne(user)

    return {
      ...user,
      id: result.insertedId.toString(),
    }
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const { db } = await connectToDatabase()

    const user = await db.collection("users").findOne({ email })
    if (!user) return null

    const isValidPassword = await this.verifyPassword(password, user.hashedPassword)
    if (!isValidPassword) return null

    // Update last active
    await db.collection("users").updateOne({ _id: user._id }, { $set: { lastActive: new Date() } })

    return {
      ...user,
      id: user._id.toString(),
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    const { db } = await connectToDatabase()

    const user = await db.collection("users").findOne({ _id: userId })
    if (!user) return null

    return {
      ...user,
      id: user._id.toString(),
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const { db } = await connectToDatabase()

    const result = await db
      .collection("users")
      .findOneAndUpdate({ _id: userId }, { $set: updates }, { returnDocument: "after" })

    if (!result) return null

    return {
      ...result,
      id: result._id.toString(),
    }
  }

  generateToken(user: User): string {
    const payload: AuthToken = {
      userId: user.id,
      email: user.email,
      username: user.username,
      subscription: user.subscription,
    }

    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
  }

  verifyToken(token: string): AuthToken | null {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthToken
    } catch (error) {
      return null
    }
  }

  createSession(userId: string): string {
    const sessionId = Math.random().toString(36).substring(2, 15)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    this.sessions.set(sessionId, { userId, expiresAt })
    return sessionId
  }

  validateSession(sessionId: string): string | null {
    const session = this.sessions.get(sessionId)
    if (!session || session.expiresAt < new Date()) {
      this.sessions.delete(sessionId)
      return null
    }
    return session.userId
  }

  destroySession(sessionId: string): void {
    this.sessions.delete(sessionId)
  }

  // Cleanup expired sessions
  cleanupSessions(): void {
    const now = new Date()
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId)
      }
    }
  }
}

// Legacy AuthManager class for backward compatibility
export class AuthManager extends AuthService {
  constructor() {
    super()
  }
}

// Create singleton instances
export const authManager = new AuthService()
export const AuthService_Instance = new AuthService()

// Cleanup expired sessions every hour
setInterval(
  () => {
    authManager.cleanupSessions()
  },
  60 * 60 * 1000,
)
