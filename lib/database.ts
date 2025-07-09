import bcrypt from "bcryptjs"

export type SubscriptionPlan = "free" | "trial" | "basic" | "premium" | "enterprise"
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "trial"

export interface UserSettings {
  userId: string
  subscription: {
    plan: SubscriptionPlan
    status: SubscriptionStatus
    startDate: Date
    endDate: Date
    trialUsed: boolean
    trialStartDate?: Date
    trialEndDate?: Date
  }
  preferences: {
    notifications: boolean
    theme: "light" | "dark"
    language: string
  }
  apiKeys: Array<{
    id: string
    name: string
    exchange: string
    publicKey: string
    encryptedPrivateKey: string
    createdAt: Date
    lastUsed?: Date
  }>
  paymentStatus?: {
    lastPayment: Date
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    stripeSessionId?: string
    stripeInvoiceId?: string
    amount: number
    currency: string
  }
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  usage?: {
    botsCreated: number
    tradesExecuted: number
    aiAnalysisUsed: number
    lastReset: Date
  }
}

export interface User {
  id: string
  email: string
  password: string
  name: string
  subscription: SubscriptionPlan
  subscriptionExpiry: Date | null
  isAdmin: boolean
  createdAt: Date
  updatedAt: Date
  autoStop?: boolean
}

export interface Bot {
  id: string
  userId: string
  name: string
  strategy: string
  status: "active" | "paused" | "stopped"
  exchange: string
  pair: string
  investment: number
  profit: number
  createdAt: Date
  updatedAt: Date
  settings: Record<string, any>
}

export interface Trade {
  id: string
  botId: string
  userId: string
  type: "buy" | "sell"
  amount: number
  price: number
  profit: number
  timestamp: Date
  pair: string
}

export interface ApiKey {
  id: string
  userId: string
  exchange: string
  keyName: string
  publicKey: string
  encryptedPrivateKey: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Mock Database Class
class DatabaseManager {
  private users: Map<string, User> = new Map()
  private bots: Map<string, Bot> = new Map()
  private trades: Map<string, Trade> = new Map()
  private userSettings: Map<string, UserSettings> = new Map()
  private apiKeys: Map<string, ApiKey> = new Map()

  constructor() {
    this.initializeMockData()
  }

  private async initializeMockData() {
    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10)
    const adminUser: User = {
      id: "admin-1",
      email: "project.command.center@gmail.com",
      password: adminPassword,
      name: "Admin User",
      subscription: "enterprise",
      subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.users.set(adminUser.id, adminUser)

    // Create admin user settings
    const adminSettings: UserSettings = {
      userId: adminUser.id,
      subscription: {
        plan: "enterprise",
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        trialUsed: false,
      },
      preferences: {
        notifications: true,
        theme: "dark",
        language: "en",
      },
      apiKeys: [],
      usage: {
        botsCreated: 0,
        tradesExecuted: 0,
        aiAnalysisUsed: 0,
        lastReset: new Date(),
      },
    }
    this.userSettings.set(adminUser.id, adminSettings)

    // Create expired user with graceful expiration
    const expiredPassword = await bcrypt.hash("expired123", 10)
    const expiredUser: User = {
      id: "user-expired",
      email: "expired@example.com",
      password: expiredPassword,
      name: "Expired User",
      subscription: "premium",
      subscriptionExpiry: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      isAdmin: false,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      autoStop: false, // Graceful expiration - existing bots keep running
    }
    this.users.set(expiredUser.id, expiredUser)

    // Create expired user settings
    const expiredSettings: UserSettings = {
      userId: expiredUser.id,
      subscription: {
        plan: "premium",
        status: "expired",
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        trialUsed: true,
      },
      preferences: {
        notifications: true,
        theme: "light",
        language: "en",
      },
      apiKeys: [],
      usage: {
        botsCreated: 2,
        tradesExecuted: 45,
        aiAnalysisUsed: 20,
        lastReset: new Date(),
      },
    }
    this.userSettings.set(expiredUser.id, expiredSettings)

    // Create active user
    const activePassword = await bcrypt.hash("user123", 10)
    const activeUser: User = {
      id: "user-1",
      email: "user@example.com",
      password: activePassword,
      name: "Active User",
      subscription: "premium",
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.users.set(activeUser.id, activeUser)

    // Create active user settings
    const activeSettings: UserSettings = {
      userId: activeUser.id,
      subscription: {
        plan: "premium",
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        trialUsed: true,
      },
      preferences: {
        notifications: true,
        theme: "dark",
        language: "en",
      },
      apiKeys: [
        {
          id: "key-1",
          name: "Binance Main",
          exchange: "binance",
          publicKey: "mock-public-key",
          encryptedPrivateKey: "mock-encrypted-private-key",
          createdAt: new Date(),
        },
      ],
      stripeCustomerId: "cus_mock123",
      stripeSubscriptionId: "sub_mock123",
      usage: {
        botsCreated: 5,
        tradesExecuted: 234,
        aiAnalysisUsed: 67,
        lastReset: new Date(),
      },
    }
    this.userSettings.set(activeUser.id, activeSettings)

    // Create trial user
    const trialPassword = await bcrypt.hash("trial123", 10)
    const trialUser: User = {
      id: "user-trial",
      email: "trial@example.com",
      password: trialPassword,
      name: "Trial User",
      subscription: "free",
      subscriptionExpiry: null,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.users.set(trialUser.id, trialUser)

    // Create trial user settings with active trial
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 2) // 2 days left

    const trialSettings: UserSettings = {
      userId: trialUser.id,
      subscription: {
        plan: "trial",
        status: "trial",
        startDate: new Date(),
        endDate: trialEndDate,
        trialUsed: true,
        trialStartDate: new Date(),
        trialEndDate: trialEndDate,
      },
      preferences: {
        notifications: true,
        theme: "light",
        language: "en",
      },
      apiKeys: [],
      usage: {
        botsCreated: 2,
        tradesExecuted: 15,
        aiAnalysisUsed: 8,
        lastReset: new Date(),
      },
    }
    this.userSettings.set(trialUser.id, trialSettings)

    // Create new user eligible for trial
    const newPassword = await bcrypt.hash("new123", 10)
    const newUser: User = {
      id: "user-new",
      email: "new@example.com",
      password: newPassword,
      name: "New User",
      subscription: "free",
      subscriptionExpiry: null,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.users.set(newUser.id, newUser)

    // Create new user settings with trial available
    const newSettings: UserSettings = {
      userId: newUser.id,
      subscription: {
        plan: "free",
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        trialUsed: false, // Trial available
      },
      preferences: {
        notifications: true,
        theme: "light",
        language: "en",
      },
      apiKeys: [],
      usage: {
        botsCreated: 0,
        tradesExecuted: 0,
        aiAnalysisUsed: 0,
        lastReset: new Date(),
      },
    }
    this.userSettings.set(newUser.id, newSettings)

    // Create sample bots
    const bot1: Bot = {
      id: "bot-1",
      userId: "user-1",
      name: "BTC Scalping Bot",
      strategy: "scalping",
      status: "active",
      exchange: "binance",
      pair: "BTC/USDT",
      investment: 1000,
      profit: 125.5,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: { stopLoss: 2, takeProfit: 3 },
    }
    this.bots.set(bot1.id, bot1)

    const bot2: Bot = {
      id: "bot-2",
      userId: "user-expired",
      name: "ETH DCA Bot",
      strategy: "dca",
      status: "active", // Still running despite expired subscription
      exchange: "coinbase",
      pair: "ETH/USD",
      investment: 500,
      profit: 45.25,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      settings: { interval: "1h", amount: 50 },
    }
    this.bots.set(bot2.id, bot2)

    const bot3: Bot = {
      id: "bot-3",
      userId: "user-trial",
      name: "Trial Bot",
      strategy: "dca",
      status: "active",
      exchange: "binance",
      pair: "ETH/USDT",
      investment: 200,
      profit: 12.5,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: { interval: "4h", amount: 25 },
    }
    this.bots.set(bot3.id, bot3)

    // Create sample trades
    const trade1: Trade = {
      id: "trade-1",
      botId: "bot-1",
      userId: "user-1",
      type: "buy",
      amount: 0.01,
      price: 45000,
      profit: 25.5,
      timestamp: new Date(),
      pair: "BTC/USDT",
    }
    this.trades.set(trade1.id, trade1)

    const trade2: Trade = {
      id: "trade-2",
      botId: "bot-3",
      userId: "user-trial",
      type: "buy",
      amount: 0.1,
      price: 2500,
      profit: 12.5,
      timestamp: new Date(),
      pair: "ETH/USDT",
    }
    this.trades.set(trade2.id, trade2)
  }

  // User operations
  async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const id = `user-${Date.now()}`
    const user: User = {
      ...userData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.users.set(id, user)

    // Create default user settings
    const userSettings: UserSettings = {
      userId: id,
      subscription: {
        plan: "free",
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        trialUsed: false, // New users get trial available
      },
      preferences: {
        notifications: true,
        theme: "light",
        language: "en",
      },
      apiKeys: [],
      usage: {
        botsCreated: 0,
        tradesExecuted: 0,
        aiAnalysisUsed: 0,
        lastReset: new Date(),
      },
    }
    this.userSettings.set(id, userSettings)

    return user
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user
      }
    }
    return null
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id)
    if (!user) return null

    const updatedUser = { ...user, ...updates, updatedAt: new Date() }
    this.users.set(id, updatedUser)
    return updatedUser
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values())
  }

  // Bot operations
  async createBot(botData: Omit<Bot, "id" | "createdAt" | "updatedAt">): Promise<Bot> {
    const id = `bot-${Date.now()}`
    const bot: Bot = {
      ...botData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.bots.set(id, bot)
    return bot
  }

  async getBotById(id: string): Promise<Bot | null> {
    return this.bots.get(id) || null
  }

  async getBotsByUserId(userId: string): Promise<Bot[]> {
    return Array.from(this.bots.values()).filter((bot) => bot.userId === userId)
  }

  async getUserBots(userId: string): Promise<Bot[]> {
    return this.getBotsByUserId(userId)
  }

  async updateBot(id: string, updates: Partial<Bot>): Promise<Bot | null> {
    const bot = this.bots.get(id)
    if (!bot) return null

    const updatedBot = { ...bot, ...updates, updatedAt: new Date() }
    this.bots.set(id, updatedBot)
    return updatedBot
  }

  async deleteBot(id: string): Promise<boolean> {
    return this.bots.delete(id)
  }

  async getAllBots(): Promise<Bot[]> {
    return Array.from(this.bots.values())
  }

  // Trade operations
  async createTrade(tradeData: Omit<Trade, "id">): Promise<Trade> {
    const id = `trade-${Date.now()}`
    const trade: Trade = { ...tradeData, id }
    this.trades.set(id, trade)
    return trade
  }

  async getTradesByBotId(botId: string): Promise<Trade[]> {
    return Array.from(this.trades.values()).filter((trade) => trade.botId === botId)
  }

  async getTradesByUserId(userId: string): Promise<Trade[]> {
    return Array.from(this.trades.values()).filter((trade) => trade.userId === userId)
  }

  async getUserTrades(userId: string, limit?: number): Promise<Trade[]> {
    const trades = this.getTradesByUserId(userId)
    return limit ? trades.slice(0, limit) : trades
  }

  // User settings operations
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    return this.userSettings.get(userId) || null
  }

  async saveUserSettings(settings: UserSettings): Promise<UserSettings> {
    this.userSettings.set(settings.userId, settings)
    return settings
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings> {
    let settings = await this.getUserSettings(userId)

    if (!settings) {
      settings = {
        userId,
        subscription: {
          plan: "free",
          status: "active",
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          trialUsed: false,
        },
        preferences: {
          notifications: true,
          theme: "light",
          language: "en",
        },
        apiKeys: [],
        usage: {
          botsCreated: 0,
          tradesExecuted: 0,
          aiAnalysisUsed: 0,
          lastReset: new Date(),
        },
      }
    }

    const updatedSettings = { ...settings, ...updates }
    this.userSettings.set(userId, updatedSettings)
    return updatedSettings
  }

  async updateSubscriptionStatus(userId: string, status: SubscriptionStatus): Promise<void> {
    const settings = this.userSettings.get(userId)
    if (settings) {
      settings.subscription.status = status
      this.userSettings.set(userId, settings)
    }
  }

  async getExpiredSubscriptions(): Promise<UserSettings[]> {
    const expired: UserSettings[] = []
    const now = new Date()

    for (const settings of this.userSettings.values()) {
      // Check for expired subscriptions
      if (settings.subscription.endDate < now && settings.subscription.status === "active") {
        expired.push(settings)
      }
      // Check for expired trials
      if (
        settings.subscription.status === "trial" &&
        settings.subscription.trialEndDate &&
        settings.subscription.trialEndDate < now
      ) {
        expired.push(settings)
      }
    }

    return expired
  }

  // API Key operations
  async createApiKey(keyData: Omit<ApiKey, "id" | "createdAt" | "updatedAt">): Promise<ApiKey> {
    const id = `key-${Date.now()}`
    const apiKey: ApiKey = {
      ...keyData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.apiKeys.set(id, apiKey)
    return apiKey
  }

  async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values()).filter((key) => key.userId === userId)
  }

  async deleteApiKey(id: string): Promise<boolean> {
    return this.apiKeys.delete(id)
  }

  // Utility methods
  async getUserStats(userId: string): Promise<{
    totalBots: number
    activeBots: number
    totalProfit: number
    totalTrades: number
  }> {
    const bots = await this.getBotsByUserId(userId)
    const trades = await this.getTradesByUserId(userId)

    return {
      totalBots: bots.length,
      activeBots: bots.filter((bot) => bot.status === "active").length,
      totalProfit: bots.reduce((sum, bot) => sum + bot.profit, 0),
      totalTrades: trades.length,
    }
  }

  async checkSubscriptionLimits(userId: string): Promise<{
    canCreateBot: boolean
    maxBots: number
    currentBots: number
    reason?: string
  }> {
    const user = await this.getUserById(userId)
    if (!user) {
      return { canCreateBot: false, maxBots: 0, currentBots: 0, reason: "User not found" }
    }

    const bots = await this.getBotsByUserId(userId)
    const currentBots = bots.length

    // Check if subscription is expired
    if (user.subscriptionExpiry && user.subscriptionExpiry < new Date()) {
      return {
        canCreateBot: false,
        maxBots: 0,
        currentBots,
        reason: "Subscription expired. Existing bots will continue running.",
      }
    }

    let maxBots = 0
    switch (user.subscription) {
      case "free":
        maxBots = 1
        break
      case "trial":
        maxBots = 3
        break
      case "basic":
        maxBots = 3
        break
      case "premium":
        maxBots = 10
        break
      case "enterprise":
        maxBots = 50
        break
    }

    return {
      canCreateBot: currentBots < maxBots,
      maxBots,
      currentBots,
      reason: currentBots >= maxBots ? "Bot limit reached for your subscription" : undefined,
    }
  }
}

// Create and export database instance
export const database = new DatabaseManager()

// Export connection function for compatibility
export async function connectToDatabase(): Promise<DatabaseManager> {
  return database
}

// Export default
export default database
