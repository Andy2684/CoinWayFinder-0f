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
    currentDrawdown: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface Trade {
  id: string
  userId: string
  botId?: string
  symbol: string
  side: "buy" | "sell"
  amount: number
  price: number
  status: "pending" | "filled" | "cancelled"
  pnl?: number
  fees: number
  timestamp: Date
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

export interface ApiKey {
  id: string
  userId: string
  name: string
  key: string
  hashedKey: string
  permissions: string[]
  isActive: boolean
  lastUsed?: Date
  expiresAt?: Date
  createdAt: Date
}

export interface SecurityEvent {
  id: string
  type: string
  severity: "low" | "medium" | "high" | "critical"
  message: string
  details: Record<string, any>
  ip?: string
  userAgent?: string
  userId?: string
  timestamp: Date
  resolved: boolean
}

class InMemoryDatabase {
  private users: Map<string, User> = new Map()
  private bots: Map<string, Bot> = new Map()
  private trades: Map<string, Trade> = new Map()
  private sessions: Map<string, Session> = new Map()
  private apiKeys: Map<string, ApiKey> = new Map()
  private securityEvents: Map<string, SecurityEvent> = new Map()

  constructor() {
    this.initializeSampleData()
  }

  private initializeSampleData() {
    // Create sample users
    const sampleUsers: User[] = [
      {
        id: "user_1",
        email: "demo@coinwayfinder.com",
        username: "demo_user",
        password: "hashed_password_123",
        isActive: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date(),
        subscription: {
          plan: "pro",
          status: "active",
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
      {
        id: "user_2",
        email: "trader@example.com",
        username: "crypto_trader",
        password: "hashed_password_456",
        isActive: true,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date(),
        subscription: {
          plan: "starter",
          status: "active",
          trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      },
    ]

    sampleUsers.forEach((user) => this.users.set(user.id, user))

    // Create sample bots
    const sampleBots: Bot[] = [
      {
        id: "bot_1",
        userId: "user_1",
        name: "BTC Scalper",
        strategy: "scalping",
        status: "active",
        config: {
          symbol: "BTC/USDT",
          amount: 1000,
          stopLoss: 2,
          takeProfit: 1.5,
          riskLevel: "medium",
        },
        performance: {
          totalTrades: 156,
          winRate: 68.5,
          totalPnL: 2450.75,
          currentDrawdown: 5.2,
        },
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date(),
      },
      {
        id: "bot_2",
        userId: "user_1",
        name: "ETH DCA Bot",
        strategy: "dca",
        status: "active",
        config: {
          symbol: "ETH/USDT",
          amount: 500,
          riskLevel: "low",
        },
        performance: {
          totalTrades: 89,
          winRate: 72.1,
          totalPnL: 1875.25,
          currentDrawdown: 2.8,
        },
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date(),
      },
    ]

    sampleBots.forEach((bot) => this.bots.set(bot.id, bot))

    // Create sample trades
    const sampleTrades: Trade[] = [
      {
        id: "trade_1",
        userId: "user_1",
        botId: "bot_1",
        symbol: "BTC/USDT",
        side: "buy",
        amount: 0.025,
        price: 42500,
        status: "filled",
        pnl: 125.5,
        fees: 2.15,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "trade_2",
        userId: "user_1",
        botId: "bot_2",
        symbol: "ETH/USDT",
        side: "buy",
        amount: 0.5,
        price: 2850,
        status: "filled",
        pnl: 45.75,
        fees: 1.42,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      {
        id: "trade_3",
        userId: "user_2",
        symbol: "ADA/USDT",
        side: "sell",
        amount: 1000,
        price: 0.485,
        status: "pending",
        fees: 0.24,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
      },
    ]

    sampleTrades.forEach((trade) => this.trades.set(trade.id, trade))
  }

  // User operations
  async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const id = generateRandomString(16)
    const user: User = {
      ...userData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.users.set(id, user)
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

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id)
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values())
  }

  // Bot operations
  async createBot(botData: Omit<Bot, "id" | "createdAt" | "updatedAt">): Promise<Bot> {
    const id = generateRandomString(16)
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
    const id = generateRandomString(16)
    const trade: Trade = {
      ...tradeData,
      id,
    }
    this.trades.set(id, trade)
    return trade
  }

  async getTradeById(id: string): Promise<Trade | null> {
    return this.trades.get(id) || null
  }

  async getTradesByUserId(userId: string): Promise<Trade[]> {
    return Array.from(this.trades.values()).filter((trade) => trade.userId === userId)
  }

  async getTradesByBotId(botId: string): Promise<Trade[]> {
    return Array.from(this.trades.values()).filter((trade) => trade.botId === botId)
  }

  async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade | null> {
    const trade = this.trades.get(id)
    if (!trade) return null

    const updatedTrade = { ...trade, ...updates }
    this.trades.set(id, updatedTrade)
    return updatedTrade
  }

  async deleteTrade(id: string): Promise<boolean> {
    return this.trades.delete(id)
  }

  async getAllTrades(): Promise<Trade[]> {
    return Array.from(this.trades.values())
  }

  // Session operations
  async createSession(sessionData: Omit<Session, "id" | "createdAt" | "lastActivity">): Promise<Session> {
    const id = generateRandomString(16)
    const session: Session = {
      ...sessionData,
      id,
      createdAt: new Date(),
      lastActivity: new Date(),
    }
    this.sessions.set(id, session)
    return session
  }

  async getSessionById(id: string): Promise<Session | null> {
    return this.sessions.get(id) || null
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    for (const session of this.sessions.values()) {
      if (session.token === token) {
        return session
      }
    }
    return null
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | null> {
    const session = this.sessions.get(id)
    if (!session) return null

    const updatedSession = { ...session, ...updates, lastActivity: new Date() }
    this.sessions.set(id, updatedSession)
    return updatedSession
  }

  async deleteSession(id: string): Promise<boolean> {
    return this.sessions.delete(id)
  }

  async deleteExpiredSessions(): Promise<number> {
    const now = new Date()
    let deletedCount = 0

    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(id)
        deletedCount++
      }
    }

    return deletedCount
  }

  // API Key operations
  async createApiKey(apiKeyData: Omit<ApiKey, "id" | "createdAt">): Promise<ApiKey> {
    const id = generateRandomString(16)
    const apiKey: ApiKey = {
      ...apiKeyData,
      id,
      createdAt: new Date(),
    }
    this.apiKeys.set(id, apiKey)
    return apiKey
  }

  async getApiKeyById(id: string): Promise<ApiKey | null> {
    return this.apiKeys.get(id) || null
  }

  async getApiKeyByHash(hashedKey: string): Promise<ApiKey | null> {
    for (const apiKey of this.apiKeys.values()) {
      if (apiKey.hashedKey === hashedKey) {
        return apiKey
      }
    }
    return null
  }

  async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values()).filter((apiKey) => apiKey.userId === userId)
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | null> {
    const apiKey = this.apiKeys.get(id)
    if (!apiKey) return null

    const updatedApiKey = { ...apiKey, ...updates }
    this.apiKeys.set(id, updatedApiKey)
    return updatedApiKey
  }

  async deleteApiKey(id: string): Promise<boolean> {
    return this.apiKeys.delete(id)
  }

  // Security Event operations
  async createSecurityEvent(eventData: Omit<SecurityEvent, "id" | "timestamp" | "resolved">): Promise<SecurityEvent> {
    const id = generateRandomString(16)
    const event: SecurityEvent = {
      ...eventData,
      id,
      timestamp: new Date(),
      resolved: false,
    }
    this.securityEvents.set(id, event)
    return event
  }

  async getSecurityEventById(id: string): Promise<SecurityEvent | null> {
    return this.securityEvents.get(id) || null
  }

  async getSecurityEventsByType(type: string): Promise<SecurityEvent[]> {
    return Array.from(this.securityEvents.values()).filter((event) => event.type === type)
  }

  async getSecurityEventsBySeverity(severity: string): Promise<SecurityEvent[]> {
    return Array.from(this.securityEvents.values()).filter((event) => event.severity === severity)
  }

  async getRecentSecurityEvents(minutes: number): Promise<SecurityEvent[]> {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return Array.from(this.securityEvents.values()).filter((event) => event.timestamp > cutoff)
  }

  async updateSecurityEvent(id: string, updates: Partial<SecurityEvent>): Promise<SecurityEvent | null> {
    const event = this.securityEvents.get(id)
    if (!event) return null

    const updatedEvent = { ...event, ...updates }
    this.securityEvents.set(id, updatedEvent)
    return updatedEvent
  }

  async deleteSecurityEvent(id: string): Promise<boolean> {
    return this.securityEvents.delete(id)
  }

  async getAllSecurityEvents(): Promise<SecurityEvent[]> {
    return Array.from(this.securityEvents.values())
  }

  // Utility methods
  async cleanup(): Promise<void> {
    // Clean up expired sessions
    await this.deleteExpiredSessions()

    // Clean up old security events (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    for (const [id, event] of this.securityEvents.entries()) {
      if (event.timestamp < thirtyDaysAgo) {
        this.securityEvents.delete(id)
      }
    }
  }

  async getStats(): Promise<{
    users: number
    bots: number
    trades: number
    sessions: number
    apiKeys: number
    securityEvents: number
  }> {
    return {
      users: this.users.size,
      bots: this.bots.size,
      trades: this.trades.size,
      sessions: this.sessions.size,
      apiKeys: this.apiKeys.size,
      securityEvents: this.securityEvents.size,
    }
  }

  // Export data for backup
  async exportData(): Promise<{
    users: User[]
    bots: Bot[]
    trades: Trade[]
    sessions: Session[]
    apiKeys: ApiKey[]
    securityEvents: SecurityEvent[]
  }> {
    return {
      users: Array.from(this.users.values()),
      bots: Array.from(this.bots.values()),
      trades: Array.from(this.trades.values()),
      sessions: Array.from(this.sessions.values()),
      apiKeys: Array.from(this.apiKeys.values()),
      securityEvents: Array.from(this.securityEvents.values()),
    }
  }

  // Import data from backup
  async importData(data: {
    users?: User[]
    bots?: Bot[]
    trades?: Trade[]
    sessions?: Session[]
    apiKeys?: ApiKey[]
    securityEvents?: SecurityEvent[]
  }): Promise<void> {
    if (data.users) {
      data.users.forEach((user) => this.users.set(user.id, user))
    }
    if (data.bots) {
      data.bots.forEach((bot) => this.bots.set(bot.id, bot))
    }
    if (data.trades) {
      data.trades.forEach((trade) => this.trades.set(trade.id, trade))
    }
    if (data.sessions) {
      data.sessions.forEach((session) => this.sessions.set(session.id, session))
    }
    if (data.apiKeys) {
      data.apiKeys.forEach((apiKey) => this.apiKeys.set(apiKey.id, apiKey))
    }
    if (data.securityEvents) {
      data.securityEvents.forEach((event) => this.securityEvents.set(event.id, event))
    }
  }
}

// Export singleton instance
export const database = new InMemoryDatabase()

// Export the class for testing
export { InMemoryDatabase }
