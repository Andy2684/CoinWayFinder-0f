import { Redis } from "ioredis"

// Database interface definitions
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

export interface Bot {
  id: string
  userId: string
  name: string
  strategy: string
  symbol: string
  isActive: boolean
  config: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface Trade {
  id: string
  botId: string
  userId: string
  symbol: string
  side: "buy" | "sell"
  amount: number
  price: number
  status: "pending" | "filled" | "cancelled"
  createdAt: Date
  executedAt?: Date
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
  lastAccessedAt: Date
}

export interface ApiKey {
  id: string
  userId: string
  name: string
  keyId: string
  hashedKey: string
  permissions: string[]
  isActive: boolean
  lastUsed?: Date
  expiresAt?: Date
  createdAt: Date
}

// Database class implementation
export class Database {
  private redis: Redis
  private static instance: Database

  constructor() {
    this.redis = new Redis(process.env.Redis_URL || "redis://localhost:6379")
    this.setupEventHandlers()
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  private setupEventHandlers(): void {
    this.redis.on("connect", () => {
      console.log("✅ Redis connected successfully")
    })

    this.redis.on("error", (error) => {
      console.error("❌ Redis connection error:", error)
    })

    this.redis.on("ready", () => {
      console.log("🚀 Redis ready for operations")
    })
  }

  // User operations
  async createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()

    const newUser: User = {
      ...user,
      id,
      createdAt: now,
      updatedAt: now,
    }

    await this.redis.hset("users", id, JSON.stringify(newUser))
    return newUser
  }

  async getUserById(id: string): Promise<User | null> {
    const userData = await this.redis.hget("users", id)
    return userData ? JSON.parse(userData) : null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.redis.hgetall("users")
    for (const userData of Object.values(users)) {
      const user = JSON.parse(userData)
      if (user.email === email) {
        return user
      }
    }
    return null
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = await this.getUserById(id)
    if (!user) return null

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    }

    await this.redis.hset("users", id, JSON.stringify(updatedUser))
    return updatedUser
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.redis.hdel("users", id)
    return result === 1
  }

  // Bot operations
  async createBot(bot: Omit<Bot, "id" | "createdAt" | "updatedAt">): Promise<Bot> {
    const id = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()

    const newBot: Bot = {
      ...bot,
      id,
      createdAt: now,
      updatedAt: now,
    }

    await this.redis.hset("bots", id, JSON.stringify(newBot))
    return newBot
  }

  async getBotById(id: string): Promise<Bot | null> {
    const botData = await this.redis.hget("bots", id)
    return botData ? JSON.parse(botData) : null
  }

  async getBotsByUserId(userId: string): Promise<Bot[]> {
    const bots = await this.redis.hgetall("bots")
    return Object.values(bots)
      .map((botData) => JSON.parse(botData))
      .filter((bot) => bot.userId === userId)
  }

  async updateBot(id: string, updates: Partial<Bot>): Promise<Bot | null> {
    const bot = await this.getBotById(id)
    if (!bot) return null

    const updatedBot = {
      ...bot,
      ...updates,
      updatedAt: new Date(),
    }

    await this.redis.hset("bots", id, JSON.stringify(updatedBot))
    return updatedBot
  }

  async deleteBot(id: string): Promise<boolean> {
    const result = await this.redis.hdel("bots", id)
    return result === 1
  }

  // Trade operations
  async createTrade(trade: Omit<Trade, "id" | "createdAt">): Promise<Trade> {
    const id = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newTrade: Trade = {
      ...trade,
      id,
      createdAt: new Date(),
    }

    await this.redis.hset("trades", id, JSON.stringify(newTrade))
    return newTrade
  }

  async getTradeById(id: string): Promise<Trade | null> {
    const tradeData = await this.redis.hget("trades", id)
    return tradeData ? JSON.parse(tradeData) : null
  }

  async getTradesByUserId(userId: string): Promise<Trade[]> {
    const trades = await this.redis.hgetall("trades")
    return Object.values(trades)
      .map((tradeData) => JSON.parse(tradeData))
      .filter((trade) => trade.userId === userId)
  }

  async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade | null> {
    const trade = await this.getTradeById(id)
    if (!trade) return null

    const updatedTrade = {
      ...trade,
      ...updates,
    }

    await this.redis.hset("trades", id, JSON.stringify(updatedTrade))
    return updatedTrade
  }

  // Session operations
  async createSession(session: Omit<Session, "id" | "createdAt" | "lastAccessedAt">): Promise<Session> {
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()

    const newSession: Session = {
      ...session,
      id,
      createdAt: now,
      lastAccessedAt: now,
    }

    await this.redis.hset("sessions", id, JSON.stringify(newSession))
    await this.redis.setex(`session_token:${session.token}`, 86400, id) // 24 hour expiry
    return newSession
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    const sessionId = await this.redis.get(`session_token:${token}`)
    if (!sessionId) return null

    const sessionData = await this.redis.hget("sessions", sessionId)
    return sessionData ? JSON.parse(sessionData) : null
  }

  async updateSessionAccess(id: string): Promise<void> {
    const session = await this.redis.hget("sessions", id)
    if (session) {
      const sessionData = JSON.parse(session)
      sessionData.lastAccessedAt = new Date()
      await this.redis.hset("sessions", id, JSON.stringify(sessionData))
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    const session = await this.redis.hget("sessions", id)
    if (session) {
      const sessionData = JSON.parse(session)
      await this.redis.del(`session_token:${sessionData.token}`)
    }
    const result = await this.redis.hdel("sessions", id)
    return result === 1
  }

  // API Key operations
  async createApiKey(apiKey: Omit<ApiKey, "id" | "createdAt">): Promise<ApiKey> {
    const id = `apikey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newApiKey: ApiKey = {
      ...apiKey,
      id,
      createdAt: new Date(),
    }

    await this.redis.hset("api_keys", id, JSON.stringify(newApiKey))
    return newApiKey
  }

  async getApiKeyById(id: string): Promise<ApiKey | null> {
    const apiKeyData = await this.redis.hget("api_keys", id)
    return apiKeyData ? JSON.parse(apiKeyData) : null
  }

  async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    const apiKeys = await this.redis.hgetall("api_keys")
    return Object.values(apiKeys)
      .map((apiKeyData) => JSON.parse(apiKeyData))
      .filter((apiKey) => apiKey.userId === userId)
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | null> {
    const apiKey = await this.getApiKeyById(id)
    if (!apiKey) return null

    const updatedApiKey = {
      ...apiKey,
      ...updates,
    }

    await this.redis.hset("api_keys", id, JSON.stringify(updatedApiKey))
    return updatedApiKey
  }

  async deleteApiKey(id: string): Promise<boolean> {
    const result = await this.redis.hdel("api_keys", id)
    return result === 1
  }

  // Health and maintenance
  async getHealth(): Promise<{ status: string; connections: number; memory: any }> {
    try {
      const info = await this.redis.info("memory")
      const dbSize = await this.redis.dbsize()

      return {
        status: "healthy",
        connections: dbSize,
        memory: {
          used: info.match(/used_memory_human:(.+)/)?.[1]?.trim() || "unknown",
          peak: info.match(/used_memory_peak_human:(.+)/)?.[1]?.trim() || "unknown",
        },
      }
    } catch (error) {
      return {
        status: "unhealthy",
        connections: 0,
        memory: { used: "unknown", peak: "unknown" },
      }
    }
  }

  async cleanup(): Promise<void> {
    // Clean up expired sessions
    const sessions = await this.redis.hgetall("sessions")
    const now = new Date()

    for (const [sessionId, sessionData] of Object.entries(sessions)) {
      const session = JSON.parse(sessionData)
      if (new Date(session.expiresAt) < now) {
        await this.deleteSession(sessionId)
      }
    }
  }

  async disconnect(): Promise<void> {
    await this.redis.disconnect()
  }
}

// Export singleton instance
export const database = Database.getInstance()

// Export for compatibility
export const connectToDatabase = () => database
