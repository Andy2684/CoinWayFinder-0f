import { simpleHash, generateRandomString } from "./security"
import { database } from "./database"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = "7d"
const ADMIN_JWT_EXPIRES_IN = "24h"

export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
  subscription?: {
    plan: string
    status: string
    expiresAt?: Date
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

export interface AuthSession {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}

class AuthService {
  private jwtSecret: string

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || "fallback-secret-key"
  }

  // Simple JWT implementation without crypto dependency
  private createJWT(payload: any): string {
    const header = { alg: "HS256", typ: "JWT" }
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url")
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")

    const signature = simpleHash(`${encodedHeader}.${encodedPayload}.${this.jwtSecret}`)

    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  private verifyJWT(token: string): any {
    try {
      const [encodedHeader, encodedPayload, signature] = token.split(".")

      if (!encodedHeader || !encodedPayload || !signature) {
        return null
      }

      const expectedSignature = simpleHash(`${encodedHeader}.${encodedPayload}.${this.jwtSecret}`)

      if (signature !== expectedSignature) {
        return null
      }

      const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString())

      // Check expiration
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return null
      }

      return payload
    } catch (error) {
      return null
    }
  }

  async hashPassword(password: string): Promise<string> {
    // Simple password hashing - in production, use bcrypt
    const salt = generateRandomString(16)
    const hash = simpleHash(password + salt)
    return `${salt}:${hash}`
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const [salt, hash] = hashedPassword.split(":")
      const expectedHash = simpleHash(password + salt)
      return hash === expectedHash
    } catch (error) {
      return false
    }
  }

  async signUp(email: string, password: string, name?: string): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = database.users.find((u) => u.email === email)
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password)

    // Create user
    const user: User = {
      id: generateRandomString(16),
      email,
      name,
      createdAt: new Date(),
      subscription: {
        plan: "free",
        status: "active",
      },
    }

    // Store user in database
    database.users.push({
      ...user,
      password: hashedPassword,
    })

    // Create JWT token
    const tokenPayload = {
      id: user.id,
      userId: user.id, // Add userId for compatibility
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    }

    const token = this.createJWT(tokenPayload)

    // Create session
    const session: AuthSession = {
      id: generateRandomString(16),
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
    }

    database.sessions.push(session)

    return { user, token }
  }

  async signIn(email: string, password: string): Promise<{ user: User; token: string }> {
    // Find user
    const dbUser = database.users.find((u) => u.email === email)
    if (!dbUser) {
      throw new Error("Invalid credentials")
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, dbUser.password)
    if (!isValidPassword) {
      throw new Error("Invalid credentials")
    }

    // Create user object without password
    const user: User = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      createdAt: dbUser.createdAt,
      subscription: dbUser.subscription,
    }

    // Create JWT token
    const tokenPayload = {
      id: user.id,
      userId: user.id, // Add userId for compatibility
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    }

    const token = this.createJWT(tokenPayload)

    // Create session
    const session: AuthSession = {
      id: generateRandomString(16),
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
    }

    database.sessions.push(session)

    return { user, token }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const cookieStore = cookies()
      const token = cookieStore.get("auth-token")?.value

      if (!token) {
        return null
      }

      const payload = this.verifyJWT(token)
      if (!payload) {
        return null
      }

      // Find user by ID (support both 'id' and 'userId' fields)
      const userId = payload.id || payload.userId
      if (!userId) {
        return null
      }

      const dbUser = database.users.find((u) => u.id === userId)
      if (!dbUser) {
        return null
      }

      // Return user without password
      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        createdAt: dbUser.createdAt,
        subscription: dbUser.subscription,
      }
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  async signOut(token: string): Promise<void> {
    // Remove session from database
    const sessionIndex = database.sessions.findIndex((s) => s.token === token)
    if (sessionIndex !== -1) {
      database.sessions.splice(sessionIndex, 1)
    }
  }

  async verifyToken(token: string): Promise<User | null> {
    const payload = this.verifyJWT(token)
    if (!payload) {
      return null
    }

    const userId = payload.id || payload.userId
    if (!userId) {
      return null
    }

    const dbUser = database.users.find((u) => u.id === userId)
    if (!dbUser) {
      return null
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      createdAt: dbUser.createdAt,
      subscription: dbUser.subscription,
    }
  }
}

export const authService = new AuthService()

// Mock lucia for compatibility
export const lucia = {
  validateSession: async (sessionId: string) => {
    const session = database.sessions.find((s) => s.id === sessionId)
    if (!session || session.expiresAt < new Date()) {
      return { session: null, user: null }
    }

    const user = database.users.find((u) => u.id === session.userId)
    return {
      session: {
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
      },
      user: user
        ? {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        : null,
    }
  },

  createSession: async (userId: string) => {
    const session: AuthSession = {
      id: generateRandomString(16),
      userId,
      token: generateRandomString(32),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    }

    database.sessions.push(session)
    return session
  },

  invalidateSession: async (sessionId: string) => {
    const index = database.sessions.findIndex((s) => s.id === sessionId)
    if (index !== -1) {
      database.sessions.splice(index, 1)
    }
  },
}
