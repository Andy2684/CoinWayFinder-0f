// Mock Database Implementation for Development
import { randomUUID } from "crypto"

// Types and Interfaces
export interface User {
  id: string
  email: string
  name: string
  password?: string
  createdAt: Date
  updatedAt: Date
  subscription?: {
    plan: string
    status: "active" | "canceled" | "expired"
    currentPeriodEnd: Date
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    autoStop?: boolean // Graceful expiration flag
  }
  settings?: UserSettings
  isAdmin?: boolean
  referralCode?: string
  referredBy?: string
}

export interface UserSettings {
  id: string
  userId: string
  notifications: {
    email: boolean
    telegram: boolean
    push: boolean
  }
  trading: {
    riskLevel: "low" | "medium" | "high"
    maxDailyLoss: number
    autoStop: boolean
  }
  telegram?: {
    chatId?: string
    username?: string
    enabled: boolean
  }
  createdAt: Date
  updatedAt: Date
}

export interface Bot {
  id: string
  userId: string
  name: string
  strategy: string
  status: "active" | "paused" | "stopped"
  config: {
    symbol: string
    exchange: string
    amount: number
    riskLevel: "low" | "medium" | "high"
    stopLoss?: number
    takeProfit?: number
    [key: string]: any
  }
  performance: {
    totalTrades: number
    winRate: number
    totalPnL: number
    dailyPnL: number
    weeklyPnL: number
    monthlyPnL: number
  }
  createdAt: Date
  updatedAt: Date
  lastRunAt?: Date
}

export interface Trade {
  id: string
  botId: string
  userId: string
  symbol: string
  side: "buy" | "sell"
  amount: number
  price: number
  fee: number
  pnl: number
  status: "pending" | "filled" | "canceled" | "failed"
  exchange: string
  orderId?: string
  executedAt?: Date
  createdAt: Date
}

export interface ApiKey {
  id: string
  userId: string
  name: string
  exchange: string
  publicKey: string
  encryptedPrivateKey: string
  permissions: string[]
  isActive: boolean
  lastUsedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Mock Data Storage
const mockUsers: Map<string, User> = new Map()
const mockBots: Map<string, Bot> = new Map()
const mockTrades: Map<string, Trade> = new Map()
const mockUserSettings: Map<string, UserSettings> = new Map()
const mockApiKeys: Map<string, ApiKey> = new Map()

// Initialize with some mock data
const initializeMockData = () => {
  // Admin user
  const adminUser: User = {
    id: "admin-001",
    email: "project.command.center@gmail.com",
    name: "Admin User",
    password: "admin123", // In production, this would be hashed
    createdAt: new Date(),
    updatedAt: new Date(),
    isAdmin: true,
    subscription: {
      plan: "enterprise",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      autoStop: false,
    },
  }

  // Demo user with expired subscription (graceful expiration)
  const expiredUser: User = {
    id: "user-expired-001",
    email: "expired@example.com",
    name: "Expired User",
    password: "password123",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    updatedAt: new Date(),
    subscription: {
      plan: "pro",
      status: "expired",
      currentPeriodEnd: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      autoStop: true, // Graceful expiration - existing bots keep running
    },
  }

  // Active user
  const activeUser: User = {
    id: "user-active-001",
    email: "active@example.com",
    name: "Active User",
    password: "password123",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    updatedAt: new Date(),
    subscription: {
      plan: "pro",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000), // 23 days from now
      autoStop: false,
    },
  }

  mockUsers.set(adminUser.id, adminUser)
  mockUsers.set(expiredUser.id, expiredUser)
  mockUsers.set(activeUser.id, activeUser)

  // Mock user settings
  const adminSettings: UserSettings = {
    id: "settings-admin-001",
    userId: adminUser.id,
    notifications: {
      email: true,
      telegram: true,
      push: true,
    },
    trading: {
      riskLevel: "medium",
      maxDailyLoss: 1000,
      autoStop: true,
    },
    telegram: {
      enabled: true,
      username: "admin_trader",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  mockUserSettings.set(adminSettings.id, adminSettings)

  // Mock bots for expired user (should keep running due to graceful expiration)
  const expiredUserBot: Bot = {
    id: "bot-expired-001",
    userId: expiredUser.id,
    name: "DCA Bitcoin Bot",
    strategy: "dca",
    status: "active", // Still running despite expired subscription
    config: {
      symbol: "BTC/USDT",
      exchange: "binance",
      amount: 100,
      riskLevel: "low",
      interval: "1h",
    },
    performance: {
      totalTrades: 45,
      winRate: 67.5,
      totalPnL: 234.56,
      dailyPnL: 12.34,
      weeklyPnL: 45.67,
      monthlyPnL: 189.23,
    },
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    updatedAt: new Date(),
    lastRunAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  }

  mockBots.set(expiredUserBot.id, expiredUserBot)

  // Mock trades
  const mockTrade: Trade = {
    id: "trade-001",
    botId: expiredUserBot.id,
    userId: expiredUser.id,
    symbol: "BTC/USDT",
    side: "buy",
    amount: 0.001,
    price: 45000,
    fee: 0.45,
    pnl: 12.34,
    status: "filled",
    exchange: "binance",
    orderId: "order-12345",
    executedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  }

  mockTrades.set(mockTrade.id, mockTrade)

  console.log("🗄️ Mock database initialized with sample data")
}

// Database Manager Class
export class DatabaseManager {
  constructor() {
    initializeMockData()
  }

  // User operations
  async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const user: User = {
      ...userData,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockUsers.set(user.id, user)
    console.log(`👤 Created user: ${user.email}`)
    return user
  }

  async getUserById(id: string): Promise<User | null> {
    return mockUsers.get(id) || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of mockUsers.values()) {
      if (user.email === email) {
        return user
      }
    }
    return null
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = mockUsers.get(id)
    if (!user) return null

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    }

    mockUsers.set(id, updatedUser)
    console.log(`👤 Updated user: ${updatedUser.email}`)
    return updatedUser
  }

  async deleteUser(id: string): Promise<boolean> {
    const deleted = mockUsers.delete(id)
    if (deleted) {
      console.log(`👤 Deleted user: ${id}`)
    }
    return deleted
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(mockUsers.values())
  }

  // Bot operations
  async createBot(botData: Omit<Bot, "id" | "createdAt" | "updatedAt">): Promise<Bot> {
    const bot: Bot = {
      ...botData,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockBots.set(bot.id, bot)
    console.log(`🤖 Created bot: ${bot.name} for user ${bot.userId}`)
    return bot
  }

  async getBotById(id: string): Promise<Bot | null> {
    return mockBots.get(id) || null
  }

  async getBotsByUserId(userId: string): Promise<Bot[]> {
    const bots = Array.from(mockBots.values()).filter((bot) => bot.userId === userId)
    return bots
  }

  async updateBot(id: string, updates: Partial<Bot>): Promise<Bot | null> {
    const bot = mockBots.get(id)
    if (!bot) return null

    const updatedBot = {
      ...bot,
      ...updates,
      updatedAt: new Date(),
    }

    mockBots.set(id, updatedBot)
    console.log(`🤖 Updated bot: ${updatedBot.name}`)
    return updatedBot
  }

  async deleteBot(id: string): Promise<boolean> {
    const deleted = mockBots.delete(id)
    if (deleted) {
      console.log(`🤖 Deleted bot: ${id}`)
    }
    return deleted
  }

  async getAllBots(): Promise<Bot[]> {
    return Array.from(mockBots.values())
  }

  // Trade operations
  async createTrade(tradeData: Omit<Trade, "id" | "createdAt">): Promise<Trade> {
    const trade: Trade = {
      ...tradeData,
      id: randomUUID(),
      createdAt: new Date(),
    }

    mockTrades.set(trade.id, trade)
    console.log(`💰 Created trade: ${trade.symbol} ${trade.side} for bot ${trade.botId}`)
    return trade
  }

  async getTradeById(id: string): Promise<Trade | null> {
    return mockTrades.get(id) || null
  }

  async getTradesByBotId(botId: string): Promise<Trade[]> {
    return Array.from(mockTrades.values()).filter((trade) => trade.botId === botId)
  }

  async getTradesByUserId(userId: string): Promise<Trade[]> {
    return Array.from(mockTrades.values()).filter((trade) => trade.userId === userId)
  }

  async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade | null> {
    const trade = mockTrades.get(id)
    if (!trade) return null

    const updatedTrade = {
      ...trade,
      ...updates,
    }

    mockTrades.set(id, updatedTrade)
    console.log(`💰 Updated trade: ${id}`)
    return updatedTrade
  }

  async getAllTrades(): Promise<Trade[]> {
    return Array.from(mockTrades.values())
  }

  // User Settings operations
  async createUserSettings(settingsData: Omit<UserSettings, "id" | "createdAt" | "updatedAt">): Promise<UserSettings> {
    const settings: UserSettings = {
      ...settingsData,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockUserSettings.set(settings.id, settings)
    console.log(`⚙️ Created settings for user: ${settings.userId}`)
    return settings
  }

  async getUserSettingsByUserId(userId: string): Promise<UserSettings | null> {
    for (const settings of mockUserSettings.values()) {
      if (settings.userId === userId) {
        return settings
      }
    }
    return null
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | null> {
    let settings = await this.getUserSettingsByUserId(userId)

    if (!settings) {
      // Create new settings if they don't exist
      settings = await this.createUserSettings({
        userId,
        notifications: {
          email: true,
          telegram: false,
          push: false,
        },
        trading: {
          riskLevel: "medium",
          maxDailyLoss: 100,
          autoStop: true,
        },
        telegram: {
          enabled: false,
        },
        ...updates,
      })
    } else {
      const updatedSettings = {
        ...settings,
        ...updates,
        updatedAt: new Date(),
      }

      mockUserSettings.set(settings.id, updatedSettings)
      settings = updatedSettings
    }

    console.log(`⚙️ Updated settings for user: ${userId}`)
    return settings
  }

  // API Key operations
  async createApiKey(keyData: Omit<ApiKey, "id" | "createdAt" | "updatedAt">): Promise<ApiKey> {
    const apiKey: ApiKey = {
      ...keyData,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockApiKeys.set(apiKey.id, apiKey)
    console.log(`🔑 Created API key: ${apiKey.name} for user ${apiKey.userId}`)
    return apiKey
  }

  async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    return Array.from(mockApiKeys.values()).filter((key) => key.userId === userId)
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | null> {
    const apiKey = mockApiKeys.get(id)
    if (!apiKey) return null

    const updatedKey = {
      ...apiKey,
      ...updates,
      updatedAt: new Date(),
    }

    mockApiKeys.set(id, updatedKey)
    console.log(`🔑 Updated API key: ${id}`)
    return updatedKey
  }

  async deleteApiKey(id: string): Promise<boolean> {
    const deleted = mockApiKeys.delete(id)
    if (deleted) {
      console.log(`🔑 Deleted API key: ${id}`)
    }
    return deleted
  }

  // Utility methods
  async getUserStats(userId: string): Promise<{
    totalBots: number
    activeBots: number
    totalTrades: number
    totalPnL: number
  }> {
    const bots = await this.getBotsByUserId(userId)
    const trades = await this.getTradesByUserId(userId)

    const activeBots = bots.filter((bot) => bot.status === "active").length
    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0)

    return {
      totalBots: bots.length,
      activeBots,
      totalTrades: trades.length,
      totalPnL,
    }
  }

  async checkUserLimits(userId: string): Promise<{
    canCreateBot: boolean
    canMakeTrade: boolean
    reason?: string
  }> {
    const user = await this.getUserById(userId)
    if (!user) {
      return { canCreateBot: false, canMakeTrade: false, reason: "User not found" }
    }

    // Check subscription status
    if (!user.subscription || user.subscription.status === "canceled") {
      return { canCreateBot: false, canMakeTrade: false, reason: "No active subscription" }
    }

    // Graceful expiration: expired users can keep existing bots running but can't create new ones
    if (user.subscription.status === "expired") {
      return {
        canCreateBot: false,
        canMakeTrade: true, // Existing bots can still trade
        reason: "Subscription expired - existing bots will continue running",
      }
    }

    // Check bot limits based on plan
    const bots = await this.getBotsByUserId(userId)
    const planLimits = {
      starter: 3,
      pro: 10,
      enterprise: -1, // unlimited
    }

    const limit = planLimits[user.subscription.plan as keyof typeof planLimits] || 0
    if (limit !== -1 && bots.length >= limit) {
      return {
        canCreateBot: false,
        canMakeTrade: true,
        reason: `Bot limit reached for ${user.subscription.plan} plan`,
      }
    }

    return { canCreateBot: true, canMakeTrade: true }
  }
}

// Create and export database instance
export const database = new DatabaseManager()

// Connection function for compatibility
export const connectToDatabase = async (): Promise<DatabaseManager> => {
  console.log("🔌 Connected to mock database")
  return database
}

// Export default for compatibility
export default {
  database,
  connectToDatabase,
  DatabaseManager,
}
