import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function connectToDatabase() {
  // Test the connection
  try {
    await sql`SELECT 1`
    return sql
  } catch (error) {
    console.error("Database connection failed:", error)
    throw error
  }
}

export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
  deleted_at?: string
  raw_json: any
}

export interface UserDocument {
  _id: string
  email: string
  username: string
  password: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  subscription: {
    plan: "free" | "starter" | "pro" | "enterprise"
    status: "active" | "inactive" | "cancelled" | "past_due"
    trialEndsAt?: Date
    currentPeriodEnd?: Date
    stripeCustomerId?: string
    stripeSubscriptionId?: string
  }
  profile: {
    firstName?: string
    lastName?: string
    avatar?: string
    timezone?: string
    notifications: {
      email: boolean
      telegram: boolean
      push: boolean
    }
  }
  settings: {
    theme: "light" | "dark" | "system"
    language: string
    currency: string
    riskTolerance: "low" | "medium" | "high"
  }
  stats: {
    totalTrades: number
    totalProfit: number
    totalLoss: number
    winRate: number
    lastActiveAt: Date
  }
}

export interface BotDocument {
  _id: string
  userId: string
  name: string
  description?: string
  strategy: string
  status: "active" | "paused" | "stopped" | "error"
  config: {
    symbol: string
    exchange: string
    amount: number
    stopLoss?: number
    takeProfit?: number
    maxTrades?: number
    riskPerTrade?: number
    [key: string]: any
  }
  performance: {
    totalTrades: number
    winningTrades: number
    losingTrades: number
    totalProfit: number
    totalLoss: number
    winRate: number
    maxDrawdown: number
    sharpeRatio?: number
  }
  createdAt: Date
  updatedAt: Date
  lastRunAt?: Date
  nextRunAt?: Date
  errorMessage?: string
}

export interface TradeDocument {
  _id: string
  userId: string
  botId: string
  symbol: string
  exchange: string
  type: "buy" | "sell"
  side: "long" | "short"
  amount: number
  price: number
  fee: number
  status: "pending" | "filled" | "cancelled" | "failed"
  timestamp: Date
  orderId?: string
  profit?: number
  loss?: number
  metadata: {
    strategy: string
    signal: string
    confidence: number
    [key: string]: any
  }
}

export interface ApiKeyDocument {
  _id: string
  userId: string
  name: string
  keyHash: string
  permissions: string[]
  isActive: boolean
  lastUsedAt?: Date
  expiresAt?: Date
  createdAt: Date
  rateLimit: {
    requestsPerMinute: number
    requestsPerHour: number
    requestsPerDay: number
  }
  usage: {
    totalRequests: number
    lastRequestAt?: Date
    requestsToday: number
    requestsThisHour: number
    requestsThisMinute: number
  }
}

export class Database {
  private sql = sql

  async connect() {
    return this.sql
  }

  // User operations using the existing neon_auth.users_sync table
  async createUser(userData: Partial<User>): Promise<User> {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    const result = await this.sql`
      INSERT INTO neon_auth.users_sync (id, email, name, created_at, updated_at, raw_json)
      VALUES (${userId}, ${userData.email}, ${userData.name || userData.email}, ${now}, ${now}, ${JSON.stringify({
        subscription: {
          plan: "free",
          status: "active",
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        profile: {
          notifications: {
            email: true,
            telegram: false,
            push: true,
          },
        },
        settings: {
          theme: "system",
          language: "en",
          currency: "USD",
          riskTolerance: "medium",
        },
        stats: {
          totalTrades: 0,
          totalProfit: 0,
          totalLoss: 0,
          winRate: 0,
          lastActiveAt: now,
        },
      })})
      RETURNING *
    `

    return result[0]
  }

  async getUserById(userId: string): Promise<User | null> {
    const result = await this.sql`
      SELECT * FROM neon_auth.users_sync 
      WHERE id = ${userId} AND deleted_at IS NULL
    `

    return result[0] || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.sql`
      SELECT * FROM neon_auth.users_sync 
      WHERE email = ${email} AND deleted_at IS NULL
    `

    return result[0] || null
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    const now = new Date().toISOString()

    const result = await this.sql`
      UPDATE neon_auth.users_sync 
      SET 
        email = COALESCE(${updates.email}, email),
        name = COALESCE(${updates.name}, name),
        raw_json = COALESCE(${updates.raw_json ? JSON.stringify(updates.raw_json) : null}, raw_json),
        updated_at = ${now}
      WHERE id = ${userId} AND deleted_at IS NULL
    `

    return result.length > 0
  }

  async deleteUser(userId: string): Promise<boolean> {
    const now = new Date().toISOString()

    const result = await this.sql`
      UPDATE neon_auth.users_sync 
      SET deleted_at = ${now}, updated_at = ${now}
      WHERE id = ${userId} AND deleted_at IS NULL
    `

    return result.length > 0
  }

  // Mock methods for bots, trades, etc. (since we only have users table)
  async createBot(botData: Partial<BotDocument>): Promise<BotDocument> {
    // Mock implementation - in a real app, you'd create a bots table
    const botId = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()

    const bot: BotDocument = {
      _id: botId,
      userId: botData.userId!,
      name: botData.name!,
      description: botData.description,
      strategy: botData.strategy!,
      status: "stopped",
      config: botData.config!,
      performance: {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalProfit: 0,
        totalLoss: 0,
        winRate: 0,
        maxDrawdown: 0,
      },
      createdAt: now,
      updatedAt: now,
      ...botData,
    }

    // Store in user's raw_json for now
    const user = await this.getUserById(botData.userId!)
    if (user) {
      const userData = user.raw_json || {}
      userData.bots = userData.bots || []
      userData.bots.push(bot)
      await this.updateUser(botData.userId!, { raw_json: userData })
    }

    return bot
  }

  async getBotById(botId: string): Promise<BotDocument | null> {
    // Mock implementation
    return null
  }

  async getBotsByUserId(userId: string): Promise<BotDocument[]> {
    const user = await this.getUserById(userId)
    if (!user || !user.raw_json) return []

    return user.raw_json.bots || []
  }

  async updateBot(botId: string, updates: Partial<BotDocument>): Promise<boolean> {
    // Mock implementation
    return true
  }

  async deleteBot(botId: string): Promise<boolean> {
    // Mock implementation
    return true
  }

  // Trade operations (mock)
  async createTrade(tradeData: Partial<TradeDocument>): Promise<TradeDocument> {
    const tradeId = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()

    const trade: TradeDocument = {
      _id: tradeId,
      userId: tradeData.userId!,
      botId: tradeData.botId!,
      symbol: tradeData.symbol!,
      exchange: tradeData.exchange!,
      type: tradeData.type!,
      side: tradeData.side!,
      amount: tradeData.amount!,
      price: tradeData.price!,
      fee: tradeData.fee || 0,
      status: "pending",
      timestamp: now,
      metadata: tradeData.metadata || {
        strategy: "",
        signal: "",
        confidence: 0,
      },
      ...tradeData,
    }

    return trade
  }

  async getTradeById(tradeId: string): Promise<TradeDocument | null> {
    return null
  }

  async getTradesByUserId(userId: string, limit = 100): Promise<TradeDocument[]> {
    return []
  }

  async getTradesByBotId(botId: string, limit = 100): Promise<TradeDocument[]> {
    return []
  }

  async updateTrade(tradeId: string, updates: Partial<TradeDocument>): Promise<boolean> {
    return true
  }

  // Analytics and statistics
  async getUserStats(userId: string): Promise<any> {
    const user = await this.getUserById(userId)
    if (!user || !user.raw_json) {
      return {
        totalTrades: 0,
        totalBots: 0,
        activeBots: 0,
        totalProfit: 0,
        totalLoss: 0,
        netProfit: 0,
        winRate: 0,
        avgTradeSize: 0,
      }
    }

    const stats = user.raw_json.stats || {}
    const bots = user.raw_json.bots || []

    return {
      totalTrades: stats.totalTrades || 0,
      totalBots: bots.length,
      activeBots: bots.filter((b: any) => b.status === "active").length,
      totalProfit: stats.totalProfit || 0,
      totalLoss: stats.totalLoss || 0,
      netProfit: (stats.totalProfit || 0) - (stats.totalLoss || 0),
      winRate: stats.winRate || 0,
      avgTradeSize: 0,
    }
  }

  async getSystemStats(): Promise<any> {
    const result = await this.sql`
      SELECT COUNT(*) as total_users
      FROM neon_auth.users_sync 
      WHERE deleted_at IS NULL
    `

    const totalUsers = Number.parseInt(result[0]?.total_users || "0")

    return {
      totalUsers,
      activeUsers: totalUsers,
      totalBots: 0,
      activeBots: 0,
      totalTrades: 0,
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.sql`SELECT 1`
      return true
    } catch (error) {
      console.error("Database health check failed:", error)
      return false
    }
  }

  // Cleanup operations
  async cleanup(): Promise<void> {
    // Neon serverless connections are automatically managed
  }
}

// Create and export the database instance
export const database = new Database()

// Export default for backward compatibility
export default database
