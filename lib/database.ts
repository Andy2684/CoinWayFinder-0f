import { Redis } from "ioredis"

// Database interfaces
export interface User {
  id: string
  email: string
  username: string
  passwordHash: string
  isActive: boolean
  isAdmin: boolean
  createdAt: Date
  lastLogin?: Date
  subscription?: {
    plan: string
    status: string
    expiresAt: Date
  }
  profile?: {
    firstName?: string
    lastName?: string
    avatar?: string
    timezone?: string
  }
}

export interface Bot {
  id: string
  userId: string
  name: string
  strategy: string
  status: "active" | "paused" | "stopped"
  config: {
    symbol: string
    amount: number
    stopLoss?: number
    takeProfit?: number
    riskLevel: "low" | "medium" | "high"
  }
  performance: {
    totalTrades: number
    winRate: number
    totalPnL: number
    maxDrawdown: number
  }
  createdAt: Date
  lastActive?: Date
}

export interface Trade {
  id: string
  botId: string
  userId: string
  symbol: string
  side: "buy" | "sell"
  amount: number
  price: number
  status: "pending" | "filled" | "cancelled" | "failed"
  executedAt?: Date
  pnl?: number
  fees?: number
  exchange: string
  orderId?: string
}

export interface ApiKey {
  id: string
  userId: string
  name: string
  keyHash: string
  permissions: string[]
  isActive: boolean
  lastUsed?: Date
  createdAt: Date
  expiresAt?: Date
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
  lastActivity: Date
  ipAddress?: string
  userAgent?: string
}

export interface DatabaseHealth {
  status: "healthy" | "degraded" | "unhealthy"
  connections: {
    redis: boolean
    postgresql?: boolean
  }
  latency: {
    redis: number
    postgresql?: number
  }
  memory: {
    used: number
    available: number
    percentage: number
  }
  uptime: number
}

class DatabaseManager {
  private redis: Redis | null = null
  private isConnected = false

  constructor() {
    this.initializeConnections()
  }

  private async initializeConnections() {
    try {
      // Initialize Redis connection
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL, {
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        })

        this.redis.on("connect", () => {
          console.log("✅ Database: Redis connected")
          this.isConnected = true
        })

        this.redis.on("error", (error) => {
          console.error("❌ Database: Redis connection error:", error)
          this.isConnected = false
        })

        await this.redis.connect()
      } else {
        console.warn("⚠️ Database: Redis URL not configured")
      }
    } catch (error) {
      console.error("❌ Database: Failed to initialize connections:", error)
    }
  }

  // User operations
  async createUser(user: Omit<User, "id" | "createdAt">): Promise<User> {
    const newUser: User = {
      ...user,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    }

    if (this.redis) {
      await this.redis.hset(`user:${newUser.id}`, {
        ...newUser,
        createdAt: newUser.createdAt.toISOString(),
        lastLogin: newUser.lastLogin?.toISOString() || "",
      })

      // Index by email and username
      await this.redis.set(`user:email:${user.email}`, newUser.id)
      await this.redis.set(`user:username:${user.username}`, newUser.id)
    }

    return newUser
  }

  async getUserById(id: string): Promise<User | null> {
    if (!this.redis) return null

    try {
      const userData = await this.redis.hgetall(`user:${id}`)
      if (!userData || Object.keys(userData).length === 0) return null

      return {
        ...userData,
        createdAt: new Date(userData.createdAt),
        lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : undefined,
        isActive: userData.isActive === "true",
        isAdmin: userData.isAdmin === "true",
      } as User
    } catch (error) {
      console.error("❌ Database: Failed to get user:", error)
      return null
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.redis) return null

    try {
      const userId = await this.redis.get(`user:email:${email}`)
      if (!userId) return null

      return this.getUserById(userId)
    } catch (error) {
      console.error("❌ Database: Failed to get user by email:", error)
      return null
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<boolean> {
    if (!this.redis) return false

    try {
      const updateData: Record<string, string> = {}
      Object.entries(updates).forEach(([key, value]) => {
        if (value instanceof Date) {
          updateData[key] = value.toISOString()
        } else if (typeof value === "boolean") {
          updateData[key] = value.toString()
        } else if (value !== undefined) {
          updateData[key] = typeof value === "object" ? JSON.stringify(value) : String(value)
        }
      })

      await this.redis.hmset(`user:${id}`, updateData)
      return true
    } catch (error) {
      console.error("❌ Database: Failed to update user:", error)
      return false
    }
  }

  // Bot operations
  async createBot(bot: Omit<Bot, "id" | "createdAt">): Promise<Bot> {
    const newBot: Bot = {
      ...bot,
      id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    }

    if (this.redis) {
      await this.redis.hset(`bot:${newBot.id}`, {
        ...newBot,
        config: JSON.stringify(newBot.config),
        performance: JSON.stringify(newBot.performance),
        createdAt: newBot.createdAt.toISOString(),
        lastActive: newBot.lastActive?.toISOString() || "",
      })

      // Index by user
      await this.redis.sadd(`user:${bot.userId}:bots`, newBot.id)
    }

    return newBot
  }

  async getBotById(id: string): Promise<Bot | null> {
    if (!this.redis) return null

    try {
      const botData = await this.redis.hgetall(`bot:${id}`)
      if (!botData || Object.keys(botData).length === 0) return null

      return {
        ...botData,
        config: JSON.parse(botData.config),
        performance: JSON.parse(botData.performance),
        createdAt: new Date(botData.createdAt),
        lastActive: botData.lastActive ? new Date(botData.lastActive) : undefined,
      } as Bot
    } catch (error) {
      console.error("❌ Database: Failed to get bot:", error)
      return null
    }
  }

  async getUserBots(userId: string): Promise<Bot[]> {
    if (!this.redis) return []

    try {
      const botIds = await this.redis.smembers(`user:${userId}:bots`)
      const bots: Bot[] = []

      for (const botId of botIds) {
        const bot = await this.getBotById(botId)
        if (bot) bots.push(bot)
      }

      return bots
    } catch (error) {
      console.error("❌ Database: Failed to get user bots:", error)
      return []
    }
  }

  async updateBot(id: string, updates: Partial<Bot>): Promise<boolean> {
    if (!this.redis) return false

    try {
      const updateData: Record<string, string> = {}
      Object.entries(updates).forEach(([key, value]) => {
        if (value instanceof Date) {
          updateData[key] = value.toISOString()
        } else if (typeof value === "object") {
          updateData[key] = JSON.stringify(value)
        } else if (value !== undefined) {
          updateData[key] = String(value)
        }
      })

      await this.redis.hmset(`bot:${id}`, updateData)
      return true
    } catch (error) {
      console.error("❌ Database: Failed to update bot:", error)
      return false
    }
  }

  // Trade operations
  async createTrade(trade: Omit<Trade, "id">): Promise<Trade> {
    const newTrade: Trade = {
      ...trade,
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }

    if (this.redis) {
      await this.redis.hset(`trade:${newTrade.id}`, {
        ...newTrade,
        executedAt: newTrade.executedAt?.toISOString() || "",
      })

      // Index by bot and user
      await this.redis.sadd(`bot:${trade.botId}:trades`, newTrade.id)
      await this.redis.sadd(`user:${trade.userId}:trades`, newTrade.id)
    }

    return newTrade
  }

  async getTradeById(id: string): Promise<Trade | null> {
    if (!this.redis) return null

    try {
      const tradeData = await this.redis.hgetall(`trade:${id}`)
      if (!tradeData || Object.keys(tradeData).length === 0) return null

      return {
        ...tradeData,
        amount: Number.parseFloat(tradeData.amount),
        price: Number.parseFloat(tradeData.price),
        pnl: tradeData.pnl ? Number.parseFloat(tradeData.pnl) : undefined,
        fees: tradeData.fees ? Number.parseFloat(tradeData.fees) : undefined,
        executedAt: tradeData.executedAt ? new Date(tradeData.executedAt) : undefined,
      } as Trade
    } catch (error) {
      console.error("❌ Database: Failed to get trade:", error)
      return null
    }
  }

  async getBotTrades(botId: string): Promise<Trade[]> {
    if (!this.redis) return []

    try {
      const tradeIds = await this.redis.smembers(`bot:${botId}:trades`)
      const trades: Trade[] = []

      for (const tradeId of tradeIds) {
        const trade = await this.getTradeById(tradeId)
        if (trade) trades.push(trade)
      }

      return trades.sort((a, b) => (b.executedAt?.getTime() || 0) - (a.executedAt?.getTime() || 0))
    } catch (error) {
      console.error("❌ Database: Failed to get bot trades:", error)
      return []
    }
  }

  // Session operations
  async createSession(session: Omit<Session, "id" | "createdAt" | "lastActivity">): Promise<Session> {
    const newSession: Session = {
      ...session,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      lastActivity: new Date(),
    }

    if (this.redis) {
      await this.redis.hset(`session:${newSession.id}`, {
        ...newSession,
        createdAt: newSession.createdAt.toISOString(),
        lastActivity: newSession.lastActivity.toISOString(),
        expiresAt: newSession.expiresAt.toISOString(),
      })

      // Set expiration
      const ttl = Math.floor((newSession.expiresAt.getTime() - Date.now()) / 1000)
      await this.redis.expire(`session:${newSession.id}`, ttl)

      // Index by user and token
      await this.redis.set(`session:token:${session.token}`, newSession.id)
      await this.redis.sadd(`user:${session.userId}:sessions`, newSession.id)
    }

    return newSession
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    if (!this.redis) return null

    try {
      const sessionId = await this.redis.get(`session:token:${token}`)
      if (!sessionId) return null

      const sessionData = await this.redis.hgetall(`session:${sessionId}`)
      if (!sessionData || Object.keys(sessionData).length === 0) return null

      return {
        ...sessionData,
        createdAt: new Date(sessionData.createdAt),
        lastActivity: new Date(sessionData.lastActivity),
        expiresAt: new Date(sessionData.expiresAt),
      } as Session
    } catch (error) {
      console.error("❌ Database: Failed to get session:", error)
      return null
    }
  }

  async updateSessionActivity(token: string): Promise<boolean> {
    if (!this.redis) return false

    try {
      const sessionId = await this.redis.get(`session:token:${token}`)
      if (!sessionId) return false

      await this.redis.hset(`session:${sessionId}`, "lastActivity", new Date().toISOString())
      return true
    } catch (error) {
      console.error("❌ Database: Failed to update session activity:", error)
      return false
    }
  }

  async deleteSession(token: string): Promise<boolean> {
    if (!this.redis) return false

    try {
      const sessionId = await this.redis.get(`session:token:${token}`)
      if (!sessionId) return false

      const sessionData = await this.redis.hgetall(`session:${sessionId}`)
      if (sessionData.userId) {
        await this.redis.srem(`user:${sessionData.userId}:sessions`, sessionId)
      }

      await this.redis.del(`session:${sessionId}`)
      await this.redis.del(`session:token:${token}`)
      return true
    } catch (error) {
      console.error("❌ Database: Failed to delete session:", error)
      return false
    }
  }

  // API Key operations
  async createApiKey(apiKey: Omit<ApiKey, "id" | "createdAt">): Promise<ApiKey> {
    const newApiKey: ApiKey = {
      ...apiKey,
      id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    }

    if (this.redis) {
      await this.redis.hset(`apikey:${newApiKey.id}`, {
        ...newApiKey,
        permissions: JSON.stringify(newApiKey.permissions),
        createdAt: newApiKey.createdAt.toISOString(),
        lastUsed: newApiKey.lastUsed?.toISOString() || "",
        expiresAt: newApiKey.expiresAt?.toISOString() || "",
        isActive: newApiKey.isActive.toString(),
      })

      // Index by user
      await this.redis.sadd(`user:${apiKey.userId}:apikeys`, newApiKey.id)
    }

    return newApiKey
  }

  async getApiKeyById(id: string): Promise<ApiKey | null> {
    if (!this.redis) return null

    try {
      const keyData = await this.redis.hgetall(`apikey:${id}`)
      if (!keyData || Object.keys(keyData).length === 0) return null

      return {
        ...keyData,
        permissions: JSON.parse(keyData.permissions),
        isActive: keyData.isActive === "true",
        createdAt: new Date(keyData.createdAt),
        lastUsed: keyData.lastUsed ? new Date(keyData.lastUsed) : undefined,
        expiresAt: keyData.expiresAt ? new Date(keyData.expiresAt) : undefined,
      } as ApiKey
    } catch (error) {
      console.error("❌ Database: Failed to get API key:", error)
      return null
    }
  }

  // Health check
  async getHealth(): Promise<DatabaseHealth> {
    const health: DatabaseHealth = {
      status: "healthy",
      connections: {
        redis: false,
      },
      latency: {
        redis: 0,
      },
      memory: {
        used: 0,
        available: 0,
        percentage: 0,
      },
      uptime: process.uptime(),
    }

    try {
      if (this.redis) {
        const start = Date.now()
        await this.redis.ping()
        health.latency.redis = Date.now() - start
        health.connections.redis = true

        // Get Redis memory info
        const info = await this.redis.info("memory")
        const memoryMatch = info.match(/used_memory:(\d+)/)
        if (memoryMatch) {
          health.memory.used = Number.parseInt(memoryMatch[1])
        }
      }

      // Determine overall status
      if (!health.connections.redis) {
        health.status = "unhealthy"
      } else if (health.latency.redis > 1000) {
        health.status = "degraded"
      }
    } catch (error) {
      console.error("❌ Database: Health check failed:", error)
      health.status = "unhealthy"
    }

    return health
  }

  // Utility methods
  async cleanup(): Promise<void> {
    try {
      if (this.redis) {
        // Clean up expired sessions
        const sessionKeys = await this.redis.keys("session:*")
        for (const key of sessionKeys) {
          const ttl = await this.redis.ttl(key)
          if (ttl === -1) {
            // No expiration set, check manually
            const sessionData = await this.redis.hgetall(key)
            if (sessionData.expiresAt && new Date(sessionData.expiresAt) < new Date()) {
              await this.redis.del(key)
            }
          }
        }

        console.log("✅ Database: Cleanup completed")
      }
    } catch (error) {
      console.error("❌ Database: Cleanup failed:", error)
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.disconnect()
        this.isConnected = false
        console.log("✅ Database: Disconnected")
      }
    } catch (error) {
      console.error("❌ Database: Disconnect failed:", error)
    }
  }

  // Getters
  get isHealthy(): boolean {
    return this.isConnected && this.redis !== null
  }

  get redisClient(): Redis | null {
    return this.redis
  }
}

// Create singleton instance
export const databaseManager = new DatabaseManager()

// Named export for compatibility
export const database = databaseManager

// Convenience functions
export const getDatabase = () => databaseManager
export const getCollection = (name: string) => databaseManager.redisClient
export const connectToDatabase = () => databaseManager
export const disconnectFromDatabase = () => databaseManager.disconnect()
export const initializeDatabase = () => databaseManager
export const getDatabaseHealth = () => databaseManager.getHealth()

// Cleanup every hour
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      databaseManager.cleanup()
    },
    60 * 60 * 1000,
  ) // 1 hour
}
