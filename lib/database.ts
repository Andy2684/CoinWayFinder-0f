import bcrypt from "bcryptjs"

export type SubscriptionPlan = "free" | "trial" | "basic" | "pro" | "enterprise"
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing"

export interface UserSettings {
  notifications: boolean
  darkMode: boolean
  riskLevel: "low" | "medium" | "high"
  trialUsed: boolean
  trialStartDate?: string
  trialEndDate?: string
}

export interface Subscription {
  id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

export interface User {
  id: string
  email: string
  password: string
  name: string
  createdAt: string
  subscription?: Subscription
  settings: UserSettings
  isAdmin?: boolean
}

export interface Bot {
  id: string
  userId: string
  name: string
  strategy: string
  status: "active" | "paused" | "stopped"
  balance: number
  pnl: number
  createdAt: string
  settings: {
    symbol: string
    amount: number
    riskLevel: "low" | "medium" | "high"
  }
}

export interface Trade {
  id: string
  botId: string
  userId: string
  symbol: string
  side: "buy" | "sell"
  amount: number
  price: number
  timestamp: string
  status: "pending" | "completed" | "failed"
  pnl?: number
}

export interface ApiKey {
  id: string
  userId: string
  name: string
  exchange: string
  publicKey: string
  encryptedPrivateKey: string
  permissions: string[]
  createdAt: string
  lastUsed?: string
}

// Mock database
class Database {
  private users: User[] = [
    {
      id: "1",
      email: "admin@coinwayfinder.com",
      password: bcrypt.hashSync("admin123", 10),
      name: "Admin User",
      createdAt: new Date().toISOString(),
      isAdmin: true,
      subscription: {
        id: "sub_admin",
        plan: "enterprise",
        status: "active",
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      settings: {
        notifications: true,
        darkMode: false,
        riskLevel: "medium",
        trialUsed: true,
      },
    },
    {
      id: "2",
      email: "user@example.com",
      password: bcrypt.hashSync("password123", 10),
      name: "John Doe",
      createdAt: new Date().toISOString(),
      subscription: {
        id: "sub_2",
        plan: "pro",
        status: "active",
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      settings: {
        notifications: true,
        darkMode: true,
        riskLevel: "high",
        trialUsed: true,
      },
    },
    {
      id: "3",
      email: "trial@example.com",
      password: bcrypt.hashSync("trial123", 10),
      name: "Trial User",
      createdAt: new Date().toISOString(),
      settings: {
        notifications: true,
        darkMode: false,
        riskLevel: "medium",
        trialUsed: false,
        trialStartDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Started 1 day ago
        trialEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Ends in 2 days
      },
    },
    {
      id: "4",
      email: "newuser@example.com",
      password: bcrypt.hashSync("newuser123", 10),
      name: "New User",
      createdAt: new Date().toISOString(),
      settings: {
        notifications: true,
        darkMode: false,
        riskLevel: "low",
        trialUsed: false, // Eligible for trial
      },
    },
  ]

  private bots: Bot[] = [
    {
      id: "1",
      userId: "2",
      name: "BTC Scalper",
      strategy: "scalping",
      status: "active",
      balance: 1000,
      pnl: 150.5,
      createdAt: new Date().toISOString(),
      settings: {
        symbol: "BTC/USDT",
        amount: 100,
        riskLevel: "medium",
      },
    },
    {
      id: "2",
      userId: "2",
      name: "ETH DCA",
      strategy: "dca",
      status: "paused",
      balance: 500,
      pnl: -25.3,
      createdAt: new Date().toISOString(),
      settings: {
        symbol: "ETH/USDT",
        amount: 50,
        riskLevel: "low",
      },
    },
  ]

  private trades: Trade[] = [
    {
      id: "1",
      botId: "1",
      userId: "2",
      symbol: "BTC/USDT",
      side: "buy",
      amount: 0.001,
      price: 45000,
      timestamp: new Date().toISOString(),
      status: "completed",
      pnl: 15.5,
    },
    {
      id: "2",
      botId: "1",
      userId: "2",
      symbol: "BTC/USDT",
      side: "sell",
      amount: 0.001,
      price: 45500,
      timestamp: new Date().toISOString(),
      status: "completed",
      pnl: 25.0,
    },
  ]

  private apiKeys: ApiKey[] = []

  // User methods
  async createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
    const user: User = {
      ...userData,
      id: (this.users.length + 1).toString(),
      createdAt: new Date().toISOString(),
      settings: {
        notifications: true,
        darkMode: false,
        riskLevel: "medium",
        trialUsed: false,
        ...userData.settings,
      },
    }
    this.users.push(user)
    return user
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) || null
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) || null
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex((user) => user.id === id)
    if (userIndex === -1) return null

    this.users[userIndex] = { ...this.users[userIndex], ...updates }
    return this.users[userIndex]
  }

  async getAllUsers(): Promise<User[]> {
    return this.users
  }

  // Bot methods
  async createBot(botData: Omit<Bot, "id" | "createdAt">): Promise<Bot> {
    const bot: Bot = {
      ...botData,
      id: (this.bots.length + 1).toString(),
      createdAt: new Date().toISOString(),
    }
    this.bots.push(bot)
    return bot
  }

  async getBotsByUserId(userId: string): Promise<Bot[]> {
    return this.bots.filter((bot) => bot.userId === userId)
  }

  async getBotById(id: string): Promise<Bot | null> {
    return this.bots.find((bot) => bot.id === id) || null
  }

  async updateBot(id: string, updates: Partial<Bot>): Promise<Bot | null> {
    const botIndex = this.bots.findIndex((bot) => bot.id === id)
    if (botIndex === -1) return null

    this.bots[botIndex] = { ...this.bots[botIndex], ...updates }
    return this.bots[botIndex]
  }

  async deleteBot(id: string): Promise<boolean> {
    const botIndex = this.bots.findIndex((bot) => bot.id === id)
    if (botIndex === -1) return false

    this.bots.splice(botIndex, 1)
    return true
  }

  // Trade methods
  async createTrade(tradeData: Omit<Trade, "id">): Promise<Trade> {
    const trade: Trade = {
      ...tradeData,
      id: (this.trades.length + 1).toString(),
    }
    this.trades.push(trade)
    return trade
  }

  async getTradesByUserId(userId: string): Promise<Trade[]> {
    return this.trades.filter((trade) => trade.userId === userId)
  }

  async getTradesByBotId(botId: string): Promise<Trade[]> {
    return this.trades.filter((trade) => trade.botId === botId)
  }

  // API Key methods
  async createApiKey(keyData: Omit<ApiKey, "id" | "createdAt">): Promise<ApiKey> {
    const apiKey: ApiKey = {
      ...keyData,
      id: (this.apiKeys.length + 1).toString(),
      createdAt: new Date().toISOString(),
    }
    this.apiKeys.push(apiKey)
    return apiKey
  }

  async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    return this.apiKeys.filter((key) => key.userId === userId)
  }

  async deleteApiKey(id: string): Promise<boolean> {
    const keyIndex = this.apiKeys.findIndex((key) => key.id === id)
    if (keyIndex === -1) return false

    this.apiKeys.splice(keyIndex, 1)
    return true
  }

  // Subscription methods
  async updateUserSubscription(userId: string, subscription: Subscription): Promise<User | null> {
    const userIndex = this.users.findIndex((user) => user.id === userId)
    if (userIndex === -1) return null

    this.users[userIndex].subscription = subscription
    return this.users[userIndex]
  }

  async getExpiredSubscriptions(): Promise<User[]> {
    const now = new Date()
    return this.users.filter((user) => {
      if (!user.subscription) return false

      const endDate = new Date(user.subscription.currentPeriodEnd)
      const isExpired = now > endDate

      // Also check for expired trials
      if (user.settings.trialEndDate) {
        const trialEndDate = new Date(user.settings.trialEndDate)
        return isExpired || (now > trialEndDate && user.settings.trialStartDate)
      }

      return isExpired
    })
  }
}

export const db = new Database()
