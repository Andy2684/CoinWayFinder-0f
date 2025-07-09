import bcrypt from "bcryptjs"

// Types
export interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  createdAt: Date
  lastLogin?: Date
  isAdmin?: boolean
}

export interface UserSettings {
  userId: string
  subscription: {
    plan: "free" | "trial" | "basic" | "premium" | "enterprise"
    status: "active" | "cancelled" | "expired" | "trial"
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

export interface TradingBot {
  id: string
  userId: string
  name: string
  strategy: string
  exchange: string
  symbol: string
  status: "active" | "paused" | "stopped"
  config: Record<string, any>
  performance: {
    totalTrades: number
    winRate: number
    totalPnL: number
    currentDrawdown: number
  }
  createdAt: Date
  lastActive?: Date
}

export interface Trade {
  id: string
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
  status: "completed" | "pending" | "failed"
}

export interface NewsItem {
  id: string
  title: string
  content: string
  source: string
  url: string
  publishedAt: Date
  sentiment: "positive" | "negative" | "neutral"
  relevantCoins: string[]
}

export interface WhaleAlert {
  id: string
  transactionHash: string
  amount: number
  symbol: string
  fromAddress: string
  toAddress: string
  timestamp: Date
  exchange?: string
  type: "deposit" | "withdrawal" | "transfer"
}

// Mock database storage
const mockUsers: Map<string, User> = new Map()
const mockUserSettings: Map<string, UserSettings> = new Map()
const mockBots: Map<string, TradingBot> = new Map()
const mockTrades: Map<string, Trade> = new Map()
const mockNews: NewsItem[] = []
const mockWhaleAlerts: WhaleAlert[] = []

// Initialize with some mock data
const initializeMockData = () => {
  // Admin user
  const adminId = "admin-123"
  const adminPasswordHash = bcrypt.hashSync("admin123", 10)

  mockUsers.set(adminId, {
    id: adminId,
    email: "admin@coinwayfinder.com",
    name: "Admin User",
    passwordHash: adminPasswordHash,
    createdAt: new Date("2024-01-01"),
    isAdmin: true,
  })

  mockUserSettings.set(adminId, {
    userId: adminId,
    subscription: {
      plan: "enterprise",
      status: "active",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2025-01-01"),
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
  })

  // Regular user with expired subscription
  const expiredUserId = "user-expired-456"
  const expiredPasswordHash = bcrypt.hashSync("password123", 10)

  mockUsers.set(expiredUserId, {
    id: expiredUserId,
    email: "expired@example.com",
    name: "Expired User",
    passwordHash: expiredPasswordHash,
    createdAt: new Date("2024-01-01"),
  })

  const expiredDate = new Date()
  expiredDate.setDate(expiredDate.getDate() - 5) // 5 days ago

  mockUserSettings.set(expiredUserId, {
    userId: expiredUserId,
    subscription: {
      plan: "basic",
      status: "expired",
      startDate: new Date("2024-01-01"),
      endDate: expiredDate,
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
  })

  // Active premium user
  const activeUserId = "user-active-789"
  const activePasswordHash = bcrypt.hashSync("password123", 10)

  mockUsers.set(activeUserId, {
    id: activeUserId,
    email: "active@example.com",
    name: "Active User",
    passwordHash: activePasswordHash,
    createdAt: new Date("2024-02-01"),
  })

  const futureDate = new Date()
  futureDate.setMonth(futureDate.getMonth() + 1)

  mockUserSettings.set(activeUserId, {
    userId: activeUserId,
    subscription: {
      plan: "premium",
      status: "active",
      startDate: new Date("2024-02-01"),
      endDate: futureDate,
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
  })

  // Trial user
  const trialUserId = "user-trial-101"
  const trialPasswordHash = bcrypt.hashSync("password123", 10)

  mockUsers.set(trialUserId, {
    id: trialUserId,
    email: "trial@example.com",
    name: "Trial User",
    passwordHash: trialPasswordHash,
    createdAt: new Date(),
  })

  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + 2) // 2 days left

  mockUserSettings.set(trialUserId, {
    userId: trialUserId,
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
  })

  // Mock some bots
  mockBots.set("bot-1", {
    id: "bot-1",
    userId: activeUserId,
    name: "BTC Scalper",
    strategy: "scalping",
    exchange: "binance",
    symbol: "BTCUSDT",
    status: "active",
    config: {
      takeProfit: 0.5,
      stopLoss: 0.3,
      tradeAmount: 100,
    },
    performance: {
      totalTrades: 45,
      winRate: 67.5,
      totalPnL: 234.56,
      currentDrawdown: 5.2,
    },
    createdAt: new Date("2024-02-15"),
    lastActive: new Date(),
  })

  mockBots.set("bot-2", {
    id: "bot-2",
    userId: trialUserId,
    name: "ETH DCA",
    strategy: "dca",
    exchange: "coinbase",
    symbol: "ETHUSD",
    status: "active",
    config: {
      interval: "daily",
      amount: 50,
    },
    performance: {
      totalTrades: 12,
      winRate: 58.3,
      totalPnL: 45.23,
      currentDrawdown: 2.1,
    },
    createdAt: new Date(),
    lastActive: new Date(),
  })

  // Mock some trades
  for (let i = 0; i < 50; i++) {
    const tradeId = `trade-${i}`
    const userId = i < 30 ? activeUserId : trialUserId
    const botId = i < 30 ? "bot-1" : "bot-2"

    mockTrades.set(tradeId, {
      id: tradeId,
      userId,
      botId,
      symbol: i < 30 ? "BTCUSDT" : "ETHUSD",
      side: Math.random() > 0.5 ? "buy" : "sell",
      amount: Math.random() * 1000 + 100,
      price: Math.random() * 50000 + 30000,
      fee: Math.random() * 10 + 1,
      pnl: (Math.random() - 0.4) * 100,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      exchange: i < 30 ? "binance" : "coinbase",
      status: "completed",
    })
  }

  // Mock news
  mockNews.push(
    {
      id: "news-1",
      title: "Bitcoin Reaches New All-Time High",
      content: "Bitcoin has surged to a new all-time high of $75,000...",
      source: "CoinDesk",
      url: "https://coindesk.com/bitcoin-ath",
      publishedAt: new Date(),
      sentiment: "positive",
      relevantCoins: ["BTC", "BTCUSDT"],
    },
    {
      id: "news-2",
      title: "Ethereum 2.0 Upgrade Shows Promise",
      content: "The latest Ethereum upgrade is showing significant improvements...",
      source: "CoinTelegraph",
      url: "https://cointelegraph.com/eth-upgrade",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      sentiment: "positive",
      relevantCoins: ["ETH", "ETHUSD"],
    },
  )

  // Mock whale alerts
  mockWhaleAlerts.push({
    id: "whale-1",
    transactionHash: "0x123...abc",
    amount: 1000,
    symbol: "BTC",
    fromAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    toAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    timestamp: new Date(),
    exchange: "binance",
    type: "withdrawal",
  })
}

// Initialize mock data
initializeMockData()

// Database class
class Database {
  // User operations
  async createUser(email: string, passwordHash: string, name: string): Promise<User> {
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const user: User = {
      id: userId,
      email,
      name,
      passwordHash,
      createdAt: new Date(),
    }

    mockUsers.set(userId, user)

    // Create default user settings with trial available
    const userSettings: UserSettings = {
      userId,
      subscription: {
        plan: "free",
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        trialUsed: false, // Trial is available for new users
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

    mockUserSettings.set(userId, userSettings)
    return user
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of mockUsers.values()) {
      if (user.email === email) {
        return user
      }
    }
    return null
  }

  async getUserById(id: string): Promise<User | null> {
    return mockUsers.get(id) || null
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    const user = mockUsers.get(userId)
    if (user) {
      user.lastLogin = new Date()
      mockUsers.set(userId, user)
    }
  }

  // User settings operations
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    return mockUserSettings.get(userId) || null
  }

  async saveUserSettings(settings: UserSettings): Promise<void> {
    mockUserSettings.set(settings.userId, settings)
  }

  async createUserWithTrial(userId: string, referralCode?: string): Promise<UserSettings> {
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 3) // 3 days from now

    const userSettings: UserSettings = {
      userId,
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
        botsCreated: 0,
        tradesExecuted: 0,
        aiAnalysisUsed: 0,
        lastReset: new Date(),
      },
    }

    mockUserSettings.set(userId, userSettings)
    return userSettings
  }

  async updateSubscriptionStatus(userId: string, status: UserSettings["subscription"]["status"]): Promise<void> {
    const settings = mockUserSettings.get(userId)
    if (settings) {
      settings.subscription.status = status
      mockUserSettings.set(userId, settings)
    }
  }

  async getExpiredSubscriptions(): Promise<UserSettings[]> {
    const expired: UserSettings[] = []
    const now = new Date()

    for (const settings of mockUserSettings.values()) {
      if (settings.subscription.endDate < now && settings.subscription.status === "active") {
        expired.push(settings)
      }
      // Also check for expired trials
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

  // Bot operations
  async getUserBots(userId: string): Promise<TradingBot[]> {
    const userBots: TradingBot[] = []
    for (const bot of mockBots.values()) {
      if (bot.userId === userId) {
        userBots.push(bot)
      }
    }
    return userBots
  }

  async createBot(bot: Omit<TradingBot, "id" | "createdAt">): Promise<TradingBot> {
    const botId = `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newBot: TradingBot = {
      ...bot,
      id: botId,
      createdAt: new Date(),
    }

    mockBots.set(botId, newBot)
    return newBot
  }

  async getBotById(botId: string): Promise<TradingBot | null> {
    return mockBots.get(botId) || null
  }

  async updateBot(botId: string, updates: Partial<TradingBot>): Promise<void> {
    const bot = mockBots.get(botId)
    if (bot) {
      Object.assign(bot, updates)
      mockBots.set(botId, bot)
    }
  }

  async deleteBot(botId: string): Promise<void> {
    mockBots.delete(botId)
  }

  // Trade operations
  async getUserTrades(userId: string, limit?: number): Promise<Trade[]> {
    const userTrades: Trade[] = []
    for (const trade of mockTrades.values()) {
      if (trade.userId === userId) {
        userTrades.push(trade)
      }
    }

    // Sort by timestamp descending
    userTrades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return limit ? userTrades.slice(0, limit) : userTrades
  }

  async createTrade(trade: Omit<Trade, "id">): Promise<Trade> {
    const tradeId = `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newTrade: Trade = {
      ...trade,
      id: tradeId,
    }

    mockTrades.set(tradeId, newTrade)
    return newTrade
  }

  // News operations
  async getLatestNews(limit = 10): Promise<NewsItem[]> {
    return mockNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()).slice(0, limit)
  }

  // Whale alerts operations
  async getWhaleAlerts(limit = 10): Promise<WhaleAlert[]> {
    return mockWhaleAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit)
  }

  // API key operations
  async saveApiKey(userId: string, apiKey: UserSettings["apiKeys"][0]): Promise<void> {
    const settings = await this.getUserSettings(userId)
    if (settings) {
      settings.apiKeys.push(apiKey)
      await this.saveUserSettings(settings)
    }
  }

  async deleteApiKey(userId: string, keyId: string): Promise<void> {
    const settings = await this.getUserSettings(userId)
    if (settings) {
      settings.apiKeys = settings.apiKeys.filter((key) => key.id !== keyId)
      await this.saveUserSettings(settings)
    }
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return Array.from(mockUsers.values())
  }

  async getAllUserSettings(): Promise<UserSettings[]> {
    return Array.from(mockUserSettings.values())
  }

  // Usage tracking
  async incrementUsage(userId: string, type: "botsCreated" | "tradesExecuted" | "aiAnalysisUsed"): Promise<void> {
    const settings = await this.getUserSettings(userId)
    if (settings && settings.usage) {
      settings.usage[type]++
      await this.saveUserSettings(settings)
    }
  }

  async resetMonthlyUsage(userId: string): Promise<void> {
    const settings = await this.getUserSettings(userId)
    if (settings && settings.usage) {
      settings.usage.tradesExecuted = 0
      settings.usage.aiAnalysisUsed = 0
      settings.usage.lastReset = new Date()
      await this.saveUserSettings(settings)
    }
  }
}

// Create database instance
export const database = new Database()

// Connection function (mock)
export async function connectToDatabase(): Promise<void> {
  // Mock connection - in real app this would connect to actual database
  console.log("Connected to mock database")
}
