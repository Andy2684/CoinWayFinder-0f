import { generateRandomString } from "./security"

export interface User {
  id: string
  email: string
  username: string
  password: string
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
  status: "active" | "paused" | "stopped"
  config: Record<string, any>
  createdAt: Date
  updatedAt: Date
  performance?: {
    totalTrades: number
    winRate: number
    totalPnL: number
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
  status: "pending" | "filled" | "cancelled"
  createdAt: Date
  filledAt?: Date
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}

export interface ApiKey {
  id: string
  userId: string
  name: string
  key: string
  permissions: string[]
  createdAt: Date
  lastUsed?: Date
}

class Database {
  public users: User[] = []
  public bots: Bot[] = []
  public trades: Trade[] = []
  public sessions: Session[] = []
  public apiKeys: ApiKey[] = []

  constructor() {
    this.initializeDefaultData()
  }

  private initializeDefaultData() {
    // Create a default user for testing
    const defaultUser: User = {
      id: "user_1",
      email: "demo@coinwayfinder.com",
      username: "demo",
      password: "hashed_password_demo123", // This would be properly hashed
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      subscription: {
        plan: "pro",
        status: "active",
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    }

    this.users.push(defaultUser)

    // Create a sample bot
    const sampleBot: Bot = {
      id: "bot_1",
      userId: "user_1",
      name: "BTC Scalping Bot",
      strategy: "scalping",
      status: "active",
      config: {
        symbol: "BTC/USDT",
        amount: 0.01,
        stopLoss: 0.02,
        takeProfit: 0.03,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      performance: {
        totalTrades: 45,
        winRate: 0.67,
        totalPnL: 234.56,
      },
    }

    this.bots.push(sampleBot)
  }

  // User operations
  async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const user: User = {
      ...userData,
      id: generateRandomString(16),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.users.push(user)
    return user
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) || null
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex((user) => user.id === id)
    if (userIndex === -1) return null

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date(),
    }

    return this.users[userIndex]
  }

  async deleteUser(id: string): Promise<boolean> {
    const userIndex = this.users.findIndex((user) => user.id === id)
    if (userIndex === -1) return false

    this.users.splice(userIndex, 1)
    return true
  }

  // Bot operations
  async createBot(botData: Omit<Bot, "id" | "createdAt" | "updatedAt">): Promise<Bot> {
    const bot: Bot = {
      ...botData,
      id: generateRandomString(16),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.bots.push(bot)
    return bot
  }

  async getBotById(id: string): Promise<Bot | null> {
    return this.bots.find((bot) => bot.id === id) || null
  }

  async getBotsByUserId(userId: string): Promise<Bot[]> {
    return this.bots.filter((bot) => bot.userId === userId)
  }

  async updateBot(id: string, updates: Partial<Bot>): Promise<Bot | null> {
    const botIndex = this.bots.findIndex((bot) => bot.id === id)
    if (botIndex === -1) return null

    this.bots[botIndex] = {
      ...this.bots[botIndex],
      ...updates,
      updatedAt: new Date(),
    }

    return this.bots[botIndex]
  }

  async deleteBot(id: string): Promise<boolean> {
    const botIndex = this.bots.findIndex((bot) => bot.id === id)
    if (botIndex === -1) return false

    this.bots.splice(botIndex, 1)
    return true
  }

  // Trade operations
  async createTrade(tradeData: Omit<Trade, "id" | "createdAt">): Promise<Trade> {
    const trade: Trade = {
      ...tradeData,
      id: generateRandomString(16),
      createdAt: new Date(),
    }

    this.trades.push(trade)
    return trade
  }

  async getTradeById(id: string): Promise<Trade | null> {
    return this.trades.find((trade) => trade.id === id) || null
  }

  async getTradesByUserId(userId: string): Promise<Trade[]> {
    return this.trades.filter((trade) => trade.userId === userId)
  }

  async getTradesByBotId(botId: string): Promise<Trade[]> {
    return this.trades.filter((trade) => trade.botId === botId)
  }

  async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade | null> {
    const tradeIndex = this.trades.findIndex((trade) => trade.id === id)
    if (tradeIndex === -1) return null

    this.trades[tradeIndex] = {
      ...this.trades[tradeIndex],
      ...updates,
    }

    return this.trades[tradeIndex]
  }

  // Session operations
  async createSession(sessionData: Omit<Session, "id" | "createdAt">): Promise<Session> {
    const session: Session = {
      ...sessionData,
      id: generateRandomString(16),
      createdAt: new Date(),
    }

    this.sessions.push(session)
    return session
  }

  async getSessionById(id: string): Promise<Session | null> {
    return this.sessions.find((session) => session.id === id) || null
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    return this.sessions.find((session) => session.token === token) || null
  }

  async deleteSession(id: string): Promise<boolean> {
    const sessionIndex = this.sessions.findIndex((session) => session.id === id)
    if (sessionIndex === -1) return false

    this.sessions.splice(sessionIndex, 1)
    return true
  }

  // API Key operations
  async createApiKey(keyData: Omit<ApiKey, "id" | "createdAt">): Promise<ApiKey> {
    const apiKey: ApiKey = {
      ...keyData,
      id: generateRandomString(16),
      createdAt: new Date(),
    }

    this.apiKeys.push(apiKey)
    return apiKey
  }

  async getApiKeyById(id: string): Promise<ApiKey | null> {
    return this.apiKeys.find((key) => key.id === id) || null
  }

  async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    return this.apiKeys.filter((key) => key.userId === userId)
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | null> {
    const keyIndex = this.apiKeys.findIndex((key) => key.id === id)
    if (keyIndex === -1) return null

    this.apiKeys[keyIndex] = {
      ...this.apiKeys[keyIndex],
      ...updates,
    }

    return this.apiKeys[keyIndex]
  }

  async deleteApiKey(id: string): Promise<boolean> {
    const keyIndex = this.apiKeys.findIndex((key) => key.id === id)
    if (keyIndex === -1) return false

    this.apiKeys.splice(keyIndex, 1)
    return true
  }

  // Utility methods
  async getAllUsers(): Promise<User[]> {
    return this.users
  }

  async getAllBots(): Promise<Bot[]> {
    return this.bots
  }

  async getAllTrades(): Promise<Trade[]> {
    return this.trades
  }

  async getStats(): Promise<{
    totalUsers: number
    totalBots: number
    totalTrades: number
    activeBots: number
  }> {
    return {
      totalUsers: this.users.length,
      totalBots: this.bots.length,
      totalTrades: this.trades.length,
      activeBots: this.bots.filter((bot) => bot.status === "active").length,
    }
  }
}

// Create and export database instance
export const database = new Database()

// Export connection function for compatibility
export async function connectToDatabase(): Promise<Database> {
  return database
}
