// In-memory database implementation for CoinWayFinder
// This provides a complete database layer without external dependencies

export interface User {
  id: string
  email: string
  username: string
  password?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  subscription?: {
    plan: string
    status: string
    trialEndsAt?: Date
    currentPeriodEnd?: Date
  }
  profile?: {
    firstName?: string
    lastName?: string
    avatar?: string
    timezone?: string
    notifications?: {
      email: boolean
      push: boolean
      telegram: boolean
    }
  }
  settings?: {
    theme: "light" | "dark" | "system"
    language: string
    currency: string
    riskTolerance: "low" | "medium" | "high"
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
    maxTrades?: number
    riskPerTrade?: number
  }
  performance: {
    totalTrades: number
    winRate: number
    totalPnL: number
    maxDrawdown: number
    sharpeRatio?: number
  }
  createdAt: Date
  updatedAt: Date
  lastTradeAt?: Date
}

export interface Trade {
  id: string
  userId: string
  botId?: string
  symbol: string
  side: "buy" | "sell"
  type: "market" | "limit" | "stop"
  amount: number
  price: number
  executedPrice?: number
  status: "pending" | "filled" | "cancelled" | "failed"
  pnl?: number
  fees?: number
  exchange: string
  createdAt: Date
  executedAt?: Date
  metadata?: {
    strategy?: string
    signal?: string
    confidence?: number
    notes?: string
  }
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
  lastAccessedAt: Date
  ipAddress?: string
  userAgent?: string
  isActive: boolean
}

export interface ApiKey {
  id: string
  userId: string
  name: string
  key: string
  permissions: string[]
  lastUsedAt?: Date
  createdAt: Date
  expiresAt?: Date
  isActive: boolean
  usage: {
    totalRequests: number
    dailyRequests: number
    lastResetAt: Date
  }
}

export interface SecurityEvent {
  id: string
  type: string
  severity: "low" | "medium" | "high" | "critical"
  description: string
  userId?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
  createdAt: Date
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
}

export interface MarketData {
  id: string
  symbol: string
  price: number
  volume: number
  change24h: number
  high24h: number
  low24h: number
  marketCap?: number
  timestamp: Date
}

export interface NewsItem {
  id: string
  title: string
  content: string
  source: string
  url?: string
  sentiment?: "positive" | "negative" | "neutral"
  relevantSymbols?: string[]
  publishedAt: Date
  createdAt: Date
}

// In-memory storage
class InMemoryDatabase {
  private users: Map<string, User> = new Map()
  private bots: Map<string, Bot> = new Map()
  private trades: Map<string, Trade> = new Map()
  private sessions: Map<string, Session> = new Map()
  private apiKeys: Map<string, ApiKey> = new Map()
  private securityEvents: Map<string, SecurityEvent> = new Map()
  private marketData: Map<string, MarketData> = new Map()
  private news: Map<string, NewsItem> = new Map()

  constructor() {
    this.initializeSampleData()
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private initializeSampleData(): void {
    // Sample users
    const sampleUsers: User[] = [
      {
        id: "user_1",
        email: "john@example.com",
        username: "john_trader",
        password: "hashed_password_1",
        isActive: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
        subscription: {
          plan: "pro",
          status: "active",
          currentPeriodEnd: new Date("2024-02-01"),
        },
        profile: {
          firstName: "John",
          lastName: "Doe",
          timezone: "UTC",
          notifications: {
            email: true,
            push: true,
            telegram: false,
          },
        },
        settings: {
          theme: "dark",
          language: "en",
          currency: "USD",
          riskTolerance: "medium",
        },
      },
      {
        id: "user_2",
        email: "alice@example.com",
        username: "alice_crypto",
        password: "hashed_password_2",
        isActive: true,
        createdAt: new Date("2024-01-05"),
        updatedAt: new Date("2024-01-20"),
        subscription: {
          plan: "starter",
          status: "active",
          trialEndsAt: new Date("2024-02-05"),
        },
        profile: {
          firstName: "Alice",
          lastName: "Smith",
          timezone: "EST",
          notifications: {
            email: true,
            push: false,
            telegram: true,
          },
        },
        settings: {
          theme: "light",
          language: "en",
          currency: "EUR",
          riskTolerance: "low",
        },
      },
    ]

    // Sample bots
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
          maxTrades: 10,
          riskPerTrade: 1,
        },
        performance: {
          totalTrades: 156,
          winRate: 68.5,
          totalPnL: 2340.5,
          maxDrawdown: -450.2,
          sharpeRatio: 1.8,
        },
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-20"),
        lastTradeAt: new Date("2024-01-20T10:30:00Z"),
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
          maxTrades: 20,
        },
        performance: {
          totalTrades: 45,
          winRate: 75.5,
          totalPnL: 890.3,
          maxDrawdown: -120.5,
        },
        createdAt: new Date("2024-01-12"),
        updatedAt: new Date("2024-01-19"),
        lastTradeAt: new Date("2024-01-19T15:45:00Z"),
      },
    ]

    // Sample trades
    const sampleTrades: Trade[] = [
      {
        id: "trade_1",
        userId: "user_1",
        botId: "bot_1",
        symbol: "BTC/USDT",
        side: "buy",
        type: "market",
        amount: 0.01,
        price: 45000,
        executedPrice: 45010,
        status: "filled",
        pnl: 15.5,
        fees: 2.25,
        exchange: "binance",
        createdAt: new Date("2024-01-20T10:30:00Z"),
        executedAt: new Date("2024-01-20T10:30:05Z"),
        metadata: {
          strategy: "scalping",
          signal: "bullish_breakout",
          confidence: 0.85,
        },
      },
      {
        id: "trade_2",
        userId: "user_1",
        botId: "bot_2",
        symbol: "ETH/USDT",
        side: "buy",
        type: "limit",
        amount: 0.5,
        price: 2800,
        executedPrice: 2795,
        status: "filled",
        pnl: 25.0,
        fees: 1.4,
        exchange: "coinbase",
        createdAt: new Date("2024-01-19T15:45:00Z"),
        executedAt: new Date("2024-01-19T15:47:00Z"),
        metadata: {
          strategy: "dca",
          signal: "scheduled_buy",
        },
      },
    ]

    // Sample market data
    const sampleMarketData: MarketData[] = [
      {
        id: "market_1",
        symbol: "BTC/USDT",
        price: 45250.5,
        volume: 1234567890,
        change24h: 2.5,
        high24h: 46000,
        low24h: 44100,
        marketCap: 890000000000,
        timestamp: new Date(),
      },
      {
        id: "market_2",
        symbol: "ETH/USDT",
        price: 2850.75,
        volume: 567890123,
        change24h: -1.2,
        high24h: 2900,
        low24h: 2780,
        marketCap: 340000000000,
        timestamp: new Date(),
      },
    ]

    // Sample news
    const sampleNews: NewsItem[] = [
      {
        id: "news_1",
        title: "Bitcoin Reaches New All-Time High",
        content: "Bitcoin has surged to a new all-time high of $46,000...",
        source: "CryptoNews",
        url: "https://cryptonews.com/bitcoin-ath",
        sentiment: "positive",
        relevantSymbols: ["BTC"],
        publishedAt: new Date("2024-01-20T08:00:00Z"),
        createdAt: new Date("2024-01-20T08:05:00Z"),
      },
      {
        id: "news_2",
        title: "Ethereum 2.0 Staking Rewards Increase",
        content: "Ethereum 2.0 staking rewards have increased to 5.2%...",
        source: "EthereumDaily",
        url: "https://ethereumdaily.com/staking-rewards",
        sentiment: "positive",
        relevantSymbols: ["ETH"],
        publishedAt: new Date("2024-01-19T14:30:00Z"),
        createdAt: new Date("2024-01-19T14:35:00Z"),
      },
    ]

    // Initialize data
    sampleUsers.forEach((user) => this.users.set(user.id, user))
    sampleBots.forEach((bot) => this.bots.set(bot.id, bot))
    sampleTrades.forEach((trade) => this.trades.set(trade.id, trade))
    sampleMarketData.forEach((data) => this.marketData.set(data.id, data))
    sampleNews.forEach((item) => this.news.set(item.id, item))
  }

  // User operations
  async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const user: User = {
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData,
    }
    this.users.set(user.id, user)
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

  async getUserByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user
      }
    }
    return null
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id)
    if (!user) return null

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    }
    this.users.set(id, updatedUser)
    return updatedUser
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id)
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values())
  }

  async getUserSettings(userId: string): Promise<User["settings"] | null> {
    const user = this.users.get(userId)
    return user?.settings || null
  }

  // Bot operations
  async createBot(botData: Omit<Bot, "id" | "createdAt" | "updatedAt">): Promise<Bot> {
    const bot: Bot = {
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...botData,
    }
    this.bots.set(bot.id, bot)
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

    const updatedBot = {
      ...bot,
      ...updates,
      updatedAt: new Date(),
    }
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
  async createTrade(tradeData: Omit<Trade, "id" | "createdAt">): Promise<Trade> {
    const trade: Trade = {
      id: this.generateId(),
      createdAt: new Date(),
      ...tradeData,
    }
    this.trades.set(trade.id, trade)
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
  async createSession(sessionData: Omit<Session, "id" | "createdAt" | "lastAccessedAt">): Promise<Session> {
    const session: Session = {
      id: this.generateId(),
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      ...sessionData,
    }
    this.sessions.set(session.id, session)
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

    const updatedSession = { ...session, ...updates }
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
  async createApiKey(keyData: Omit<ApiKey, "id" | "createdAt">): Promise<ApiKey> {
    const apiKey: ApiKey = {
      id: this.generateId(),
      createdAt: new Date(),
      ...keyData,
    }
    this.apiKeys.set(apiKey.id, apiKey)
    return apiKey
  }

  async getApiKeyById(id: string): Promise<ApiKey | null> {
    return this.apiKeys.get(id) || null
  }

  async getApiKeyByKey(key: string): Promise<ApiKey | null> {
    for (const apiKey of this.apiKeys.values()) {
      if (apiKey.key === key) {
        return apiKey
      }
    }
    return null
  }

  async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values()).filter((key) => key.userId === userId)
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | null> {
    const apiKey = this.apiKeys.get(id)
    if (!apiKey) return null

    const updatedKey = { ...apiKey, ...updates }
    this.apiKeys.set(id, updatedKey)
    return updatedKey
  }

  async deleteApiKey(id: string): Promise<boolean> {
    return this.apiKeys.delete(id)
  }

  // Security Event operations
  async createSecurityEvent(eventData: Omit<SecurityEvent, "id" | "createdAt">): Promise<SecurityEvent> {
    const event: SecurityEvent = {
      id: this.generateId(),
      createdAt: new Date(),
      ...eventData,
    }
    this.securityEvents.set(event.id, event)
    return event
  }

  async getSecurityEventById(id: string): Promise<SecurityEvent | null> {
    return this.securityEvents.get(id) || null
  }

  async getSecurityEventsByUserId(userId: string): Promise<SecurityEvent[]> {
    return Array.from(this.securityEvents.values()).filter((event) => event.userId === userId)
  }

  async getSecurityEventsBySeverity(severity: SecurityEvent["severity"]): Promise<SecurityEvent[]> {
    return Array.from(this.securityEvents.values()).filter((event) => event.severity === severity)
  }

  async updateSecurityEvent(id: string, updates: Partial<SecurityEvent>): Promise<SecurityEvent | null> {
    const event = this.securityEvents.get(id)
    if (!event) return null

    const updatedEvent = { ...event, ...updates }
    this.securityEvents.set(id, updatedEvent)
    return updatedEvent
  }

  async getAllSecurityEvents(): Promise<SecurityEvent[]> {
    return Array.from(this.securityEvents.values())
  }

  // Market Data operations
  async createMarketData(data: Omit<MarketData, "id">): Promise<MarketData> {
    const marketData: MarketData = {
      id: this.generateId(),
      ...data,
    }
    this.marketData.set(marketData.id, marketData)
    return marketData
  }

  async getMarketDataBySymbol(symbol: string): Promise<MarketData | null> {
    for (const data of this.marketData.values()) {
      if (data.symbol === symbol) {
        return data
      }
    }
    return null
  }

  async getAllMarketData(): Promise<MarketData[]> {
    return Array.from(this.marketData.values())
  }

  async updateMarketData(id: string, updates: Partial<MarketData>): Promise<MarketData | null> {
    const data = this.marketData.get(id)
    if (!data) return null

    const updatedData = { ...data, ...updates }
    this.marketData.set(id, updatedData)
    return updatedData
  }

  // News operations
  async createNews(newsData: Omit<NewsItem, "id" | "createdAt">): Promise<NewsItem> {
    const news: NewsItem = {
      id: this.generateId(),
      createdAt: new Date(),
      ...newsData,
    }
    this.news.set(news.id, news)
    return news
  }

  async getNewsById(id: string): Promise<NewsItem | null> {
    return this.news.get(id) || null
  }

  async getAllNews(): Promise<NewsItem[]> {
    return Array.from(this.news.values()).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
  }

  async getNewsBySymbol(symbol: string): Promise<NewsItem[]> {
    return Array.from(this.news.values())
      .filter((item) => item.relevantSymbols?.includes(symbol))
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
  }

  // Utility operations
  async cleanup(): Promise<void> {
    // Clean up expired sessions
    await this.deleteExpiredSessions()

    // Clean up old security events (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    for (const [id, event] of this.securityEvents.entries()) {
      if (event.createdAt < thirtyDaysAgo && event.resolved) {
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
    marketData: number
    news: number
  }> {
    return {
      users: this.users.size,
      bots: this.bots.size,
      trades: this.trades.size,
      sessions: this.sessions.size,
      apiKeys: this.apiKeys.size,
      securityEvents: this.securityEvents.size,
      marketData: this.marketData.size,
      news: this.news.size,
    }
  }

  // Export/Import for backup
  async exportData(): Promise<{
    users: User[]
    bots: Bot[]
    trades: Trade[]
    sessions: Session[]
    apiKeys: ApiKey[]
    securityEvents: SecurityEvent[]
    marketData: MarketData[]
    news: NewsItem[]
  }> {
    return {
      users: Array.from(this.users.values()),
      bots: Array.from(this.bots.values()),
      trades: Array.from(this.trades.values()),
      sessions: Array.from(this.sessions.values()),
      apiKeys: Array.from(this.apiKeys.values()),
      securityEvents: Array.from(this.securityEvents.values()),
      marketData: Array.from(this.marketData.values()),
      news: Array.from(this.news.values()),
    }
  }

  async importData(data: {
    users?: User[]
    bots?: Bot[]
    trades?: Trade[]
    sessions?: Session[]
    apiKeys?: ApiKey[]
    securityEvents?: SecurityEvent[]
    marketData?: MarketData[]
    news?: NewsItem[]
  }): Promise<void> {
    if (data.users) {
      this.users.clear()
      data.users.forEach((user) => this.users.set(user.id, user))
    }
    if (data.bots) {
      this.bots.clear()
      data.bots.forEach((bot) => this.bots.set(bot.id, bot))
    }
    if (data.trades) {
      this.trades.clear()
      data.trades.forEach((trade) => this.trades.set(trade.id, trade))
    }
    if (data.sessions) {
      this.sessions.clear()
      data.sessions.forEach((session) => this.sessions.set(session.id, session))
    }
    if (data.apiKeys) {
      this.apiKeys.clear()
      data.apiKeys.forEach((key) => this.apiKeys.set(key.id, key))
    }
    if (data.securityEvents) {
      this.securityEvents.clear()
      data.securityEvents.forEach((event) => this.securityEvents.set(event.id, event))
    }
    if (data.marketData) {
      this.marketData.clear()
      data.marketData.forEach((item) => this.marketData.set(item.id, item))
    }
    if (data.news) {
      this.news.clear()
      data.news.forEach((item) => this.news.set(item.id, item))
    }
  }
}

// Export singleton instance
export const database = new InMemoryDatabase()
