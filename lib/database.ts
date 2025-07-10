import { Redis } from "ioredis"

// Database connection singleton
let redisClient: Redis | null = null

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(process.env.Redis_URL || "redis://localhost:6379", {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    })
  }
  return redisClient
}

// User management
export interface User {
  id: string
  email: string
  username: string
  passwordHash: string
  role: "user" | "admin" | "premium"
  subscription?: {
    plan: string
    status: string
    expiresAt: string
  }
  createdAt: string
  updatedAt: string
  isActive: boolean
  profile?: {
    firstName?: string
    lastName?: string
    avatar?: string
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
    [key: string]: any
  }
  performance: {
    totalTrades: number
    winRate: number
    totalPnL: number
    currentDrawdown: number
  }
  createdAt: string
  updatedAt: string
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
  timestamp: string
  pnl?: number
  fees?: number
}

export interface Session {
  id: string
  userId: string
  token: string
  refreshToken: string
  expiresAt: string
  createdAt: string
  ipAddress?: string
  userAgent?: string
}

export interface ApiKey {
  id: string
  userId: string
  name: string
  key: string
  permissions: string[]
  lastUsed?: string
  createdAt: string
  isActive: boolean
}

class Database {
  private redis: Redis

  constructor() {
    this.redis = getRedisClient()
  }

  // User operations
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const newUser: User = {
      ...user,
      id,
      createdAt: now,
      updatedAt: now,
    }

    await this.redis.hset('users', id, JSON.stringify(newUser))
    await this.redis.hset('users_by_email', user.email, id)
    await this.redis.hset('users_by_username', user.username, id)

    return newUser
  }

  async getUserById(id: string): Promise<User | null> {
    const userData = await this.redis.hget('users', id)
    return userData ? JSON.parse(userData) : null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const userId = await this.redis.hget('users_by_email', email)
    return userId ? this.getUserById(userId) : null
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const userId = await this.redis.hget('users_by_username', username)
    return userId ? this.getUserById(userId) : null
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = await this.getUserById(id)
    if (!user) return null

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await this.redis.hset('users', id, JSON.stringify(updatedUser))
    return updatedUser
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.getUserById(id)
    if (!user) return false

    await this.redis.hdel('users', id)
    await this.redis.hdel('users_by_email', user.email)
    await this.redis.hdel('users_by_username', user.username)
    
    // Clean up related data
    await this.redis.del(`sessions:${id}`)
    await this.redis.del(`api_keys:${id}`)
    
    return true
  }

  // Bot operations
  async createBot(bot: Omit<Bot, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bot> {
    const id = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const newBot: Bot = {
      ...bot,
      id,
      createdAt: now,
      updatedAt: now,
    }

    await this.redis.hset('bots', id, JSON.stringify(newBot))
    await this.redis.sadd(`user_bots:${bot.userId}`, id)

    return newBot
  }

  async getBotById(id: string): Promise<Bot | null> {
    const botData = await this.redis.hget('bots', id)
    return botData ? JSON.parse(botData) : null
  }

  async getBotsByUserId(userId: string): Promise<Bot[]> {
    const botIds = await this.redis.smembers(`user_bots:${userId}`)
    const bots = await Promise.all(
      botIds.map(id => this.getBotById(id))
    )
    return bots.filter(bot => bot !== null) as Bot[]
  }

  async updateBot(id: string, updates: Partial<Bot>): Promise<Bot | null> {
    const bot = await this.getBotById(id)
    if (!bot) return null

    const updatedBot = {
      ...bot,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await this.redis.hset('bots', id, JSON.stringify(updatedBot))
    return updatedBot
  }

  async deleteBot(id: string): Promise<boolean> {
    const bot = await this.getBotById(id)
    if (!bot) return false

    await this.redis.hdel('bots', id)
    await this.redis.srem(`user_bots:${bot.userId}`, id)
    
    // Clean up related trades
    const trades = await this.getTradesByBotId(id)
    for (const trade of trades) {
      await this.deleteTrade(trade.id)
    }
    
    return true
  }

  // Trade operations
  async createTrade(trade: Omit<Trade, 'id'>): Promise<Trade> {
    const id = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newTrade: Trade = {
      ...trade,
      \
