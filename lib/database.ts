import { ObjectId } from "mongodb"

// Mock database implementation for development
interface User {
  _id?: ObjectId
  email: string
  name: string
  password: string
  isVerified: boolean
  createdAt: Date
  lastLoginAt?: Date
  subscription?: {
    plan: string
    status: string
    endDate: Date
  }
}

interface Bot {
  _id?: ObjectId
  userId: string
  name: string
  strategy: string
  exchange: string
  symbol: string
  status: "active" | "paused" | "stopped"
  settings: Record<string, any>
  performance: {
    totalTrades: number
    winRate: number
    totalPnL: number
    roi: number
  }
  createdAt: Date
  lastRunAt?: Date
  autoStop?: boolean
}

interface Trade {
  _id?: ObjectId
  userId: string
  botId: string
  symbol: string
  side: "buy" | "sell"
  amount: number
  price: number
  fee: number
  pnl: number
  timestamp: Date
  exchange: string
}

interface UserSettings {
  _id?: ObjectId
  userId: string
  notifications: {
    email: boolean
    telegram: boolean
    discord: boolean
  }
  trading: {
    maxRiskPerTrade: number
    stopLossPercentage: number
    takeProfitPercentage: number
  }
  subscription: {
    plan: string
    status: string
    endDate: Date
    limits: {
      maxBots: number
      maxTrades: number
    }
  }
  createdAt: Date
  updatedAt: Date
}

interface ApiKey {
  _id?: ObjectId
  userId: string
  exchange: string
  name: string
  apiKey: string
  secretKey: string
  passphrase?: string
  isActive: boolean
  permissions: string[]
  createdAt: Date
  lastUsedAt?: Date
}

class DatabaseManager {
  private users: User[] = []
  private bots: Bot[] = []
  private trades: Trade[] = []
  private userSettings: UserSettings[] = []
  private apiKeys: ApiKey[] = []
  private connected = false

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    // Mock admin user
    const adminUser: User = {
      _id: new ObjectId(),
      email: "project.command.center@gmail.com",
      name: "Admin User",
      password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm", // hashed password
      isVerified: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      subscription: {
        plan: "enterprise",
        status: "active",
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    }

    // Mock expired user (graceful expiration)
    const expiredUser: User = {
      _id: new ObjectId(),
      email: "expired@example.com",
      name: "Expired User",
      password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm",
      isVerified: true,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      lastLoginAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      subscription: {
        plan: "pro",
        status: "expired",
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    }

    // Mock active user
    const activeUser: User = {
      _id: new ObjectId(),
      email: "user@example.com",
      name: "Active User",
      password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm",
      isVerified: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastLoginAt: new Date(),
      subscription: {
        plan: "pro",
        status: "active",
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }

    this.users = [adminUser, expiredUser, activeUser]

    // Mock user settings
    this.userSettings = this.users.map((user) => ({
      _id: new ObjectId(),
      userId: user._id!.toString(),
      notifications: {
        email: true,
        telegram: false,
        discord: false,
      },
      trading: {
        maxRiskPerTrade: 2,
        stopLossPercentage: 5,
        takeProfitPercentage: 10,
      },
      subscription: user.subscription!,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    }))

    // Mock bots for expired user (should keep running)
    const expiredUserBot: Bot = {
      _id: new ObjectId(),
      userId: expiredUser._id!.toString(),
      name: "DCA Bot (Expired User)",
      strategy: "DCA",
      exchange: "binance",
      symbol: "BTC/USDT",
      status: "active",
      settings: {
        amount: 100,
        interval: "1h",
        buyDips: true,
      },
      performance: {
        totalTrades: 45,
        winRate: 67,
        totalPnL: 234.56,
        roi: 12.3,
      },
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      lastRunAt: new Date(),
      autoStop: false, // Graceful expiration - keep running
    }

    // Mock bot for active user
    const activeUserBot: Bot = {
      _id: new ObjectId(),
      userId: activeUser._id!.toString(),
      name: "Scalping Bot",
      strategy: "Scalping",
      exchange: "coinbase",
      symbol: "ETH/USD",
      status: "active",
      settings: {
        amount: 500,
        spread: 0.1,
        maxPositions: 3,
      },
      performance: {
        totalTrades: 123,
        winRate: 72,
        totalPnL: 567.89,
        roi: 18.7,
      },
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      lastRunAt: new Date(),
    }

    this.bots = [expiredUserBot, activeUserBot]

    // Mock trades
    this.trades = [
      {
        _id: new ObjectId(),
        userId: expiredUser._id!.toString(),
        botId: expiredUserBot._id!.toString(),
        symbol: "BTC/USDT",
        side: "buy",
        amount: 0.001,
        price: 45000,
        fee: 0.45,
        pnl: 12.34,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        exchange: "binance",
      },
      {
        _id: new ObjectId(),
        userId: activeUser._id!.toString(),
        botId: activeUserBot._id!.toString(),
        symbol: "ETH/USD",
        side: "sell",
        amount: 0.1,
        price: 3200,
        fee: 0.32,
        pnl: 8.76,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        exchange: "coinbase",
      },
    ]

    // Mock API keys
    this.apiKeys = [
      {
        _id: new ObjectId(),
        userId: activeUser._id!.toString(),
        exchange: "binance",
        name: "Binance Main",
        apiKey: "mock_api_key_123",
        secretKey: "mock_secret_key_456",
        isActive: true,
        permissions: ["spot", "futures"],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        lastUsedAt: new Date(),
      },
    ]
  }

  async connect(): Promise<void> {
    // Mock connection
    this.connected = true
    console.log("Connected to mock database")
  }

  async disconnect(): Promise<void> {
    this.connected = false
    console.log("Disconnected from mock database")
  }

  // User operations
  async createUser(userData: Omit<User, "_id" | "createdAt">): Promise<string> {
    const user: User = {
      _id: new ObjectId(),
      ...userData,
      createdAt: new Date(),
    }
    this.users.push(user)
    return user._id.toString()
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find((user) => user._id?.toString() === id) || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) || null
  }

  async updateUser(id: string, updates: Partial<User>): Promise<boolean> {
    const index = this.users.findIndex((user) => user._id?.toString() === id)
    if (index === -1) return false

    this.users[index] = { ...this.users[index], ...updates }
    return true
  }

  async deleteUser(id: string): Promise<boolean> {
    const index = this.users.findIndex((user) => user._id?.toString() === id)
    if (index === -1) return false

    this.users.splice(index, 1)
    return true
  }

  // Bot operations
  async createBot(botData: Omit<Bot, "_id" | "createdAt">): Promise<string> {
    const bot: Bot = {
      _id: new ObjectId(),
      ...botData,
      createdAt: new Date(),
    }
    this.bots.push(bot)
    return bot._id.toString()
  }

  async getBotById(id: string): Promise<Bot | null> {
    return this.bots.find((bot) => bot._id?.toString() === id) || null
  }

  async getBotsByUserId(userId: string): Promise<Bot[]> {
    return this.bots.filter((bot) => bot.userId === userId)
  }

  async updateBot(id: string, updates: Partial<Bot>): Promise<boolean> {
    const index = this.bots.findIndex((bot) => bot._id?.toString() === id)
    if (index === -1) return false

    this.bots[index] = { ...this.bots[index], ...updates }
    return true
  }

  async deleteBot(id: string): Promise<boolean> {
    const index = this.bots.findIndex((bot) => bot._id?.toString() === id)
    if (index === -1) return false

    this.bots.splice(index, 1)
    return true
  }

  // Trade operations
  async createTrade(tradeData: Omit<Trade, "_id">): Promise<string> {
    const trade: Trade = {
      _id: new ObjectId(),
      ...tradeData,
    }
    this.trades.push(trade)
    return trade._id.toString()
  }

  async getTradesByUserId(userId: string): Promise<Trade[]> {
    return this.trades.filter((trade) => trade.userId === userId)
  }

  async getTradesByBotId(botId: string): Promise<Trade[]> {
    return this.trades.filter((trade) => trade.botId === botId)
  }

  // User settings operations
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    return this.userSettings.find((settings) => settings.userId === userId) || null
  }

  async createUserSettings(settingsData: Omit<UserSettings, "_id" | "createdAt" | "updatedAt">): Promise<string> {
    const settings: UserSettings = {
      _id: new ObjectId(),
      ...settingsData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.userSettings.push(settings)
    return settings._id.toString()
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<boolean> {
    const index = this.userSettings.findIndex((settings) => settings.userId === userId)
    if (index === -1) return false

    this.userSettings[index] = {
      ...this.userSettings[index],
      ...updates,
      updatedAt: new Date(),
    }
    return true
  }

  // API Key operations
  async createApiKey(keyData: Omit<ApiKey, "_id" | "createdAt">): Promise<string> {
    const apiKey: ApiKey = {
      _id: new ObjectId(),
      ...keyData,
      createdAt: new Date(),
    }
    this.apiKeys.push(apiKey)
    return apiKey._id.toString()
  }

  async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    return this.apiKeys.filter((key) => key.userId === userId)
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<boolean> {
    const index = this.apiKeys.findIndex((key) => key._id?.toString() === id)
    if (index === -1) return false

    this.apiKeys[index] = { ...this.apiKeys[index], ...updates }
    return true
  }

  async deleteApiKey(id: string): Promise<boolean> {
    const index = this.apiKeys.findIndex((key) => key._id?.toString() === id)
    if (index === -1) return false

    this.apiKeys.splice(index, 1)
    return true
  }

  // Utility methods
  async createUserWithTrial(userId: string): Promise<UserSettings> {
    const trialSettings: UserSettings = {
      _id: new ObjectId(),
      userId,
      notifications: {
        email: true,
        telegram: false,
        discord: false,
      },
      trading: {
        maxRiskPerTrade: 1,
        stopLossPercentage: 5,
        takeProfitPercentage: 10,
      },
      subscription: {
        plan: "trial",
        status: "active",
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
        limits: {
          maxBots: 1,
          maxTrades: 100,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.userSettings.push(trialSettings)
    return trialSettings
  }

  async getUserStats(userId: string): Promise<{
    totalBots: number
    activeBots: number
    totalTrades: number
    totalPnL: number
    winRate: number
  }> {
    const userBots = await this.getBotsByUserId(userId)
    const userTrades = await this.getTradesByUserId(userId)

    const activeBots = userBots.filter((bot) => bot.status === "active").length
    const totalPnL = userTrades.reduce((sum, trade) => sum + trade.pnl, 0)
    const winningTrades = userTrades.filter((trade) => trade.pnl > 0).length
    const winRate = userTrades.length > 0 ? (winningTrades / userTrades.length) * 100 : 0

    return {
      totalBots: userBots.length,
      activeBots,
      totalTrades: userTrades.length,
      totalPnL,
      winRate,
    }
  }

  async checkSubscriptionLimits(userId: string): Promise<{
    canCreateBot: boolean
    maxBots: number
    currentBots: number
    subscriptionStatus: string
  }> {
    const settings = await this.getUserSettings(userId)
    const userBots = await this.getBotsByUserId(userId)

    if (!settings) {
      return {
        canCreateBot: false,
        maxBots: 0,
        currentBots: userBots.length,
        subscriptionStatus: "none",
      }
    }

    const canCreateBot =
      settings.subscription.status === "active" && userBots.length < settings.subscription.limits.maxBots

    return {
      canCreateBot,
      maxBots: settings.subscription.limits.maxBots,
      currentBots: userBots.length,
      subscriptionStatus: settings.subscription.status,
    }
  }
}

// Create singleton instance
const database = new DatabaseManager()

// Connection function
export async function connectToDatabase(): Promise<void> {
  await database.connect()
}

// Export the database instance
export { database }

// Export types
export type { User, Bot, Trade, UserSettings, ApiKey }
