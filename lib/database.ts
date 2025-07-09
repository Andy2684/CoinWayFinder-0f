import crypto from "crypto"

export interface UserBot {
  _id?: string
  userId: string
  name: string
  exchange: string
  strategy: string
  symbol: string
  status: "running" | "stopped" | "paused" | "error"
  config: {
    riskLevel: number
    lotSize: number
    takeProfit: number
    stopLoss: number
    dcaInterval?: string
    investment: number
    runtime?: {
      type: "time" | "profit"
      value: number // hours for time, $ for profit
    }
    aiRecommendations: boolean
    parameters: Record<string, any>
  }
  credentials: {
    apiKey: string
    secretKey: string
    passphrase?: string
    encrypted: boolean
  }
  stats: {
    totalTrades: number
    winningTrades: number
    totalProfit: number
    totalLoss: number
    winRate: number
    maxDrawdown: number
    createdAt: Date
    lastTradeAt?: Date
    startedAt?: Date
    stoppedAt?: Date
  }
  riskAnalysis?: {
    riskScore: number
    riskLevel: "low" | "medium" | "high" | "extreme"
    warnings: string[]
    recommendations: string[]
    analyzedAt: Date
  }
  lastExecutedAt?: Date
  lastError?: string
  lastErrorAt?: Date
  executionCount: number
  createdAt: Date
  updatedAt: Date
}

export interface TradeRecord {
  _id?: string
  botId: string
  userId: string
  orderId: string
  symbol: string
  side: "buy" | "sell"
  type: "market" | "limit"
  amount: number
  price: number
  fee: number
  profit?: number
  status: "pending" | "filled" | "cancelled" | "failed"
  timestamp: Date
  exchange: string
  strategy: string
  metadata?: Record<string, any>
}

export interface UserSettings {
  _id?: string
  userId: string
  subscription: {
    plan: "free" | "basic" | "premium" | "enterprise"
    status: "active" | "cancelled" | "expired"
    startDate: Date
    endDate: Date
    trialUsed: boolean
    trialEndDate?: Date
  }
  preferences: {
    notifications: {
      email: boolean
      telegram: boolean
      webhooks: boolean
      discord: boolean
    }
    riskManagement: {
      maxDailyLoss: number
      maxPositionSize: number
      emergencyStop: boolean
      aiRiskCheck: boolean
    }
    ui: {
      theme: "dark" | "light"
      currency: "USD" | "BTC" | "ETH"
      language: string
    }
  }
  apiKeys: {
    telegram?: string
    discord?: string
    webhook?: string
  }
  referrals: {
    referralCode: string
    referredBy?: string
    referredUsers: string[]
    bonusDays: number
  }
  paymentStatus?: {
    lastPayment: Date
    stripeSessionId?: string
    stripeSubscriptionId?: string
    coinbaseChargeId?: string
    amount: number
    currency: string
    stripeInvoiceId?: string
  }
  stripeSubscriptionId?: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  _id?: string
  id: string
  email: string
  password: string
  name: string
  username: string
  subscriptionStatus: "active" | "expired" | "cancelled"
  subscriptionPlan: string
  subscriptionExpiry: Date
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  isVerified: boolean
  verificationToken?: string
  isAdmin?: boolean
  passwordHash: string
}

export interface ArbitrageOpportunity {
  _id?: string
  symbol: string
  buyExchange: string
  sellExchange: string
  buyPrice: number
  sellPrice: number
  profitPercent: number
  volume: number
  timestamp: Date
  status: "active" | "executed" | "expired"
}

export interface AIAnalysis {
  _id?: string
  userId: string
  botId?: string
  symbol: string
  analysis: {
    sentiment: "bullish" | "bearish" | "neutral"
    confidence: number
    signals: string[]
    recommendations: string[]
    riskFactors: string[]
  }
  marketData: {
    price: number
    volume: number
    volatility: number
    trend: string
  }
  timestamp: Date
}

export interface Bot {
  id: string
  userId: string
  name: string
  strategy: string
  exchange: string
  status: "running" | "stopped" | "paused" | "completed"
  subscriptionStatus: "active" | "expired"
  autoStop: boolean
  startTime: Date
  endTime: Date | null
  config: Record<string, any>
  performance: {
    totalTrades: number
    profitLoss: number
    winRate: number
  }
  createdAt: Date
  updatedAt: Date
}

class DatabaseManager {
  private encryptionKey: string
  private users: Map<string, User> = new Map()
  private bots: Map<string, Bot> = new Map()
  private trades: Map<string, TradeRecord> = new Map()
  private userSettings: Map<string, UserSettings> = new Map()
  private connected = false

  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || "default-key-change-in-production"
    this.initializeMockData()
  }

  private initializeMockData() {
    // Create admin user
    const adminUser: User = {
      id: "admin_001",
      email: "project.command.center@gmail.com",
      password: "CoinWayFinder2024!",
      passwordHash: "$2a$10$hashedPasswordForAdmin", // bcrypt hash of "CoinWayFinder2024!"
      name: "Admin User",
      username: "admin",
      subscriptionStatus: "active",
      subscriptionPlan: "enterprise",
      subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: true,
      isAdmin: true,
    }

    // Create sample users
    const sampleUsers: User[] = [
      {
        id: "user_001",
        email: "john@example.com",
        password: "password123",
        passwordHash: "$2a$10$hashedPasswordForJohn",
        name: "John Doe",
        username: "john",
        subscriptionStatus: "active",
        subscriptionPlan: "pro",
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: true,
      },
      {
        id: "user_002",
        email: "jane@example.com",
        password: "password456",
        passwordHash: "$2a$10$hashedPasswordForJane",
        name: "Jane Smith",
        username: "jane",
        subscriptionStatus: "expired",
        subscriptionPlan: "starter",
        subscriptionExpiry: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: true,
      },
    ]

    // Add users to database
    this.users.set(adminUser.id, adminUser)
    sampleUsers.forEach((user) => this.users.set(user.id, user))

    // Create sample bots
    const sampleBots: Bot[] = [
      {
        id: "bot_001",
        userId: "user_001",
        name: "BTC DCA Bot",
        strategy: "dca",
        exchange: "binance",
        status: "running",
        subscriptionStatus: "active",
        autoStop: false,
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        endTime: null,
        config: {
          symbol: "BTCUSDT",
          amount: 100,
          interval: "1h",
          riskLevel: 3,
          investment: 1000,
        },
        performance: {
          totalTrades: 24,
          profitLoss: 150.75,
          winRate: 0.67,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "bot_002",
        userId: "user_002",
        name: "ETH Scalping Bot",
        strategy: "scalping",
        exchange: "bybit",
        status: "running",
        subscriptionStatus: "expired", // User's subscription expired but bot continues
        autoStop: false, // Graceful expiration - bot continues running
        startTime: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        endTime: null,
        config: {
          symbol: "ETHUSDT",
          amount: 50,
          interval: "5m",
          riskLevel: 5,
          investment: 500,
        },
        performance: {
          totalTrades: 96,
          profitLoss: -25.3,
          winRate: 0.45,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    sampleBots.forEach((bot) => this.bots.set(bot.id, bot))

    // Create sample user settings
    const sampleUserSettings: UserSettings[] = [
      {
        userId: "user_001",
        subscription: {
          plan: "premium",
          status: "active",
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          trialUsed: true,
        },
        preferences: {
          notifications: {
            email: true,
            telegram: false,
            webhooks: false,
            discord: false,
          },
          riskManagement: {
            maxDailyLoss: 500,
            maxPositionSize: 2000,
            emergencyStop: true,
            aiRiskCheck: true,
          },
          ui: {
            theme: "dark",
            currency: "USD",
            language: "en",
          },
        },
        apiKeys: {},
        referrals: {
          referralCode: "REF001",
          referredUsers: [],
          bonusDays: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: "user_002",
        subscription: {
          plan: "basic",
          status: "expired",
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          trialUsed: true,
        },
        preferences: {
          notifications: {
            email: true,
            telegram: false,
            webhooks: false,
            discord: false,
          },
          riskManagement: {
            maxDailyLoss: 100,
            maxPositionSize: 500,
            emergencyStop: true,
            aiRiskCheck: false,
          },
          ui: {
            theme: "light",
            currency: "USD",
            language: "en",
          },
        },
        apiKeys: {},
        referrals: {
          referralCode: "REF002",
          referredUsers: [],
          bonusDays: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    sampleUserSettings.forEach((settings) => this.userSettings.set(settings.userId, settings))
  }

  async connect(): Promise<void> {
    if (this.connected) return

    console.log("📊 Connected to mock database")
    this.connected = true
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return

    console.log("📊 Disconnected from mock database")
    this.connected = false
  }

  private encrypt(text: string): string {
    const cipher = crypto.createCipher("aes-256-cbc", this.encryptionKey)
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    return encrypted
  }

  private decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipher("aes-256-cbc", this.encryptionKey)
    let decrypted = decipher.update(encryptedText, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  }

  // User operations
  async createUser(user: Omit<User, "_id" | "id" | "createdAt" | "updatedAt">): Promise<string> {
    await this.connect()

    const newUser: User = {
      ...user,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.users.set(newUser.id, newUser)
    return newUser.id
  }

  async getUserByEmail(email: string): Promise<User | null> {
    await this.connect()

    for (const user of this.users.values()) {
      if (user.email === email) {
        return user
      }
    }
    return null
  }

  async getUserById(userId: string): Promise<User | null> {
    await this.connect()

    return this.users.get(userId) || null
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    await this.connect()

    const user = this.users.get(userId)
    if (!user) return false

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    }
    this.users.set(userId, updatedUser)
    return true
  }

  // Bot operations
  async createBot(bot: Omit<UserBot, "_id" | "createdAt" | "updatedAt">): Promise<string> {
    await this.connect()

    const botId = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newBot: UserBot = {
      ...bot,
      _id: botId,
      credentials: {
        ...bot.credentials,
        apiKey: this.encrypt(bot.credentials.apiKey),
        secretKey: this.encrypt(bot.credentials.secretKey),
        passphrase: bot.credentials.passphrase ? this.encrypt(bot.credentials.passphrase) : undefined,
        encrypted: true,
      },
      executionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Convert to Bot format for storage
    const simplifiedBot: Bot = {
      id: botId,
      userId: bot.userId,
      name: bot.name,
      strategy: bot.strategy,
      exchange: bot.exchange,
      status: bot.status,
      subscriptionStatus: "active",
      autoStop: false,
      startTime: new Date(),
      endTime: null,
      config: bot.config,
      performance: {
        totalTrades: 0,
        profitLoss: 0,
        winRate: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.bots.set(botId, simplifiedBot)
    return botId
  }

  async getBot(botId: string, userId: string): Promise<UserBot | null> {
    await this.connect()

    const bot = this.bots.get(botId)
    if (!bot || bot.userId !== userId) return null

    // Convert back to UserBot format
    const userBot: UserBot = {
      _id: bot.id,
      userId: bot.userId,
      name: bot.name,
      exchange: bot.exchange,
      strategy: bot.strategy,
      symbol: bot.config.symbol || "BTCUSDT",
      status: bot.status,
      config: {
        riskLevel: bot.config.riskLevel || 3,
        lotSize: bot.config.lotSize || 0.1,
        takeProfit: bot.config.takeProfit || 2,
        stopLoss: bot.config.stopLoss || 1,
        dcaInterval: bot.config.dcaInterval,
        investment: bot.config.investment || 1000,
        runtime: bot.config.runtime,
        aiRecommendations: bot.config.aiRecommendations || false,
        parameters: bot.config,
      },
      credentials: {
        apiKey: "decrypted_api_key",
        secretKey: "decrypted_secret_key",
        passphrase: undefined,
        encrypted: false,
      },
      stats: {
        totalTrades: bot.performance.totalTrades,
        winningTrades: Math.floor(bot.performance.totalTrades * bot.performance.winRate),
        totalProfit: Math.max(0, bot.performance.profitLoss),
        totalLoss: Math.abs(Math.min(0, bot.performance.profitLoss)),
        winRate: bot.performance.winRate * 100,
        maxDrawdown: 0,
        createdAt: bot.createdAt,
      },
      executionCount: 0,
      createdAt: bot.createdAt,
      updatedAt: bot.updatedAt,
    }

    return userBot
  }

  async getUserBots(userId: string): Promise<UserBot[]> {
    await this.connect()

    const userBots: UserBot[] = []

    for (const bot of this.bots.values()) {
      if (bot.userId === userId) {
        const userBot = await this.getBot(bot.id, userId)
        if (userBot) {
          userBots.push(userBot)
        }
      }
    }

    return userBots
  }

  async getRunningBots(): Promise<UserBot[]> {
    await this.connect()

    const runningBots: UserBot[] = []

    for (const bot of this.bots.values()) {
      if (bot.status === "running") {
        const userBot = await this.getBot(bot.id, bot.userId)
        if (userBot) {
          runningBots.push(userBot)
        }
      }
    }

    return runningBots
  }

  async updateBot(botId: string, userId: string, updates: Partial<UserBot>): Promise<boolean> {
    await this.connect()

    const bot = this.bots.get(botId)
    if (!bot || bot.userId !== userId) return false

    const updatedBot = {
      ...bot,
      ...updates,
      updatedAt: new Date(),
    }
    this.bots.set(botId, updatedBot)
    return true
  }

  async deleteBot(botId: string, userId: string): Promise<boolean> {
    await this.connect()

    const bot = this.bots.get(botId)
    if (!bot || bot.userId !== userId) return false

    return this.bots.delete(botId)
  }

  // Trade operations
  async saveTrade(trade: Omit<TradeRecord, "_id">): Promise<string> {
    await this.connect()

    const tradeId = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newTrade: TradeRecord = {
      ...trade,
      _id: tradeId,
      timestamp: new Date(),
    }

    this.trades.set(tradeId, newTrade)
    return tradeId
  }

  async getBotTrades(botId: string, limit = 100): Promise<TradeRecord[]> {
    await this.connect()

    const trades = Array.from(this.trades.values())
      .filter((trade) => trade.botId === botId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)

    return trades
  }

  async getUserTrades(userId: string, limit = 100): Promise<TradeRecord[]> {
    await this.connect()

    const trades = Array.from(this.trades.values())
      .filter((trade) => trade.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)

    return trades
  }

  async updateTradeStatus(tradeId: string, status: TradeRecord["status"], profit?: number): Promise<boolean> {
    await this.connect()

    const trade = this.trades.get(tradeId)
    if (!trade) return false

    const updatedTrade = {
      ...trade,
      status,
      profit: profit !== undefined ? profit : trade.profit,
    }
    this.trades.set(tradeId, updatedTrade)
    return true
  }

  // User settings operations
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    await this.connect()

    return this.userSettings.get(userId) || null
  }

  async saveUserSettings(settings: Omit<UserSettings, "_id">): Promise<string> {
    await this.connect()

    const updatedSettings = {
      ...settings,
      updatedAt: new Date(),
    }

    this.userSettings.set(settings.userId, updatedSettings)
    return settings.userId
  }

  async createUserWithTrial(userId: string, referredBy?: string): Promise<UserSettings> {
    const referralCode = crypto.randomBytes(8).toString("hex").toUpperCase()
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 3)

    let bonusDays = 0
    if (referredBy) {
      bonusDays = 5
      trialEndDate.setDate(trialEndDate.getDate() + bonusDays)
      await this.addReferralBonus(referredBy, userId)
    }

    const userSettings: UserSettings = {
      userId,
      subscription: {
        plan: "free",
        status: "active",
        startDate: new Date(),
        endDate: trialEndDate,
        trialUsed: true,
        trialEndDate,
      },
      preferences: {
        notifications: {
          email: true,
          telegram: false,
          webhooks: false,
          discord: false,
        },
        riskManagement: {
          maxDailyLoss: 100,
          maxPositionSize: 1000,
          emergencyStop: true,
          aiRiskCheck: true,
        },
        ui: {
          theme: "dark",
          currency: "USD",
          language: "en",
        },
      },
      apiKeys: {},
      referrals: {
        referralCode,
        referredBy,
        referredUsers: [],
        bonusDays,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await this.saveUserSettings(userSettings)
    return userSettings
  }

  private async addReferralBonus(referrerId: string, newUserId: string): Promise<void> {
    const settings = this.userSettings.get(referrerId)
    if (!settings) return

    settings.referrals.referredUsers.push(newUserId)
    settings.referrals.bonusDays += 5
    settings.updatedAt = new Date()

    this.userSettings.set(referrerId, settings)
  }

  // Arbitrage operations
  async saveArbitrageOpportunity(opportunity: Omit<ArbitrageOpportunity, "_id">): Promise<string> {
    await this.connect()

    const opportunityId = `arb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newOpportunity: ArbitrageOpportunity = {
      ...opportunity,
      _id: opportunityId,
      timestamp: new Date(),
    }

    // Store in a separate map if needed
    return opportunityId
  }

  async getArbitrageOpportunities(minProfitPercent = 1, limit = 50): Promise<ArbitrageOpportunity[]> {
    await this.connect()

    // Return mock arbitrage opportunities
    return [
      {
        _id: "arb_001",
        symbol: "BTCUSDT",
        buyExchange: "binance",
        sellExchange: "bybit",
        buyPrice: 45000,
        sellPrice: 45500,
        profitPercent: 1.11,
        volume: 1000,
        timestamp: new Date(),
        status: "active",
      },
    ]
  }

  // AI Analysis operations
  async saveAIAnalysis(analysis: Omit<AIAnalysis, "_id">): Promise<string> {
    await this.connect()

    const analysisId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newAnalysis: AIAnalysis = {
      ...analysis,
      _id: analysisId,
      timestamp: new Date(),
    }

    // Store in a separate map if needed
    return analysisId
  }

  async getLatestAIAnalysis(userId: string, symbol: string): Promise<AIAnalysis | null> {
    await this.connect()

    // Return mock AI analysis
    return {
      _id: "ai_001",
      userId,
      symbol,
      analysis: {
        sentiment: "bullish",
        confidence: 0.75,
        signals: ["RSI oversold", "Moving average crossover"],
        recommendations: ["Consider long position", "Set stop loss at 5%"],
        riskFactors: ["High volatility", "Market uncertainty"],
      },
      marketData: {
        price: 45000,
        volume: 1000000,
        volatility: 0.15,
        trend: "upward",
      },
      timestamp: new Date(),
    }
  }

  // Performance and statistics
  async getBotPerformance(botId: string): Promise<{
    totalTrades: number
    totalProfit: number
    winRate: number
    avgProfit: number
    maxDrawdown: number
    profitByDay: Array<{ date: string; profit: number }>
  }> {
    await this.connect()

    const bot = this.bots.get(botId)
    if (!bot) {
      return {
        totalTrades: 0,
        totalProfit: 0,
        winRate: 0,
        avgProfit: 0,
        maxDrawdown: 0,
        profitByDay: [],
      }
    }

    return {
      totalTrades: bot.performance.totalTrades,
      totalProfit: Math.max(0, bot.performance.profitLoss),
      winRate: bot.performance.winRate * 100,
      avgProfit: bot.performance.totalTrades > 0 ? bot.performance.profitLoss / bot.performance.totalTrades : 0,
      maxDrawdown: 0,
      profitByDay: [{ date: new Date().toISOString().split("T")[0], profit: bot.performance.profitLoss }],
    }
  }

  async getPortfolioStats(userId: string): Promise<{
    totalBots: number
    activeBots: number
    totalProfit: number
    totalTrades: number
    avgWinRate: number
    totalInvestment: number
    dailyPnL: number
  }> {
    await this.connect()

    const userBots = Array.from(this.bots.values()).filter((bot) => bot.userId === userId)
    const userTrades = Array.from(this.trades.values()).filter((trade) => trade.userId === userId)

    const totalProfit = userTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0)
    const winningTrades = userTrades.filter((trade) => (trade.profit || 0) > 0)
    const avgWinRate = userTrades.length > 0 ? (winningTrades.length / userTrades.length) * 100 : 0
    const totalInvestment = userBots.reduce((sum, bot) => sum + (bot.config.investment || 0), 0)

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const dailyTrades = userTrades.filter((trade) => trade.timestamp >= yesterday)
    const dailyPnL = dailyTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0)

    return {
      totalBots: userBots.length,
      activeBots: userBots.filter((bot) => bot.status === "running").length,
      totalProfit,
      totalTrades: userTrades.length,
      avgWinRate,
      totalInvestment,
      dailyPnL,
    }
  }

  async getTopPerformingBots(
    userId: string,
    limit = 10,
  ): Promise<
    Array<{
      botId: string
      name: string
      strategy: string
      profit: number
      winRate: number
      trades: number
    }>
  > {
    await this.connect()

    const userBots = Array.from(this.bots.values())
      .filter((bot) => bot.userId === userId)
      .sort((a, b) => b.performance.profitLoss - a.performance.profitLoss)
      .slice(0, limit)

    return userBots.map((bot) => ({
      botId: bot.id,
      name: bot.name,
      strategy: bot.strategy,
      profit: bot.performance.profitLoss,
      winRate: bot.performance.winRate * 100,
      trades: bot.performance.totalTrades,
    }))
  }

  // Subscription management
  async getExpiredSubscriptions(): Promise<UserSettings[]> {
    await this.connect()

    const now = new Date()
    return Array.from(this.userSettings.values()).filter(
      (settings) => settings.subscription.endDate < now && settings.subscription.status === "active",
    )
  }

  async updateSubscriptionStatus(userId: string, status: "active" | "expired" | "cancelled"): Promise<boolean> {
    await this.connect()

    const settings = this.userSettings.get(userId)
    if (!settings) return false

    settings.subscription.status = status
    settings.updatedAt = new Date()

    this.userSettings.set(userId, settings)
    return true
  }

  async stopUserBots(userId: string, reason: string): Promise<number> {
    await this.connect()

    let stoppedCount = 0

    for (const [botId, bot] of this.bots.entries()) {
      if (bot.userId === userId && bot.status === "running") {
        bot.status = "stopped"
        bot.updatedAt = new Date()
        this.bots.set(botId, bot)
        stoppedCount++
      }
    }

    return stoppedCount
  }
}

// Create singleton instance
export const database = new DatabaseManager()

// Export connectToDatabase function
export const connectToDatabase = async () => {
  await database.connect()
  return database
}

// Export Database class for compatibility
export class Database {
  static async connect() {
    return database.connect()
  }

  static async disconnect() {
    return database.disconnect()
  }

  static async getUser(id: string): Promise<User | null> {
    return database.getUserById(id)
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return database.getUserByEmail(email)
  }

  static async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const userId = await database.createUser(userData)
    const user = await database.getUserById(userId)
    return user!
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const success = await database.updateUser(id, updates)
    if (!success) return null
    return database.getUserById(id)
  }

  static async getUserBots(userId: string): Promise<Bot[]> {
    const userBots = await database.getUserBots(userId)
    return userBots.map((bot) => ({
      id: bot._id!,
      userId: bot.userId,
      name: bot.name,
      strategy: bot.strategy,
      exchange: bot.exchange,
      status: bot.status,
      subscriptionStatus: "active",
      autoStop: false,
      startTime: bot.createdAt,
      endTime: null,
      config: bot.config,
      performance: {
        totalTrades: bot.stats.totalTrades,
        profitLoss: bot.stats.totalProfit - bot.stats.totalLoss,
        winRate: bot.stats.winRate / 100,
      },
      createdAt: bot.createdAt,
      updatedAt: bot.updatedAt,
    }))
  }

  static async createBot(botData: Omit<Bot, "id" | "createdAt" | "updatedAt">): Promise<Bot> {
    const userBotData: Omit<UserBot, "_id" | "createdAt" | "updatedAt"> = {
      userId: botData.userId,
      name: botData.name,
      exchange: botData.exchange,
      strategy: botData.strategy,
      symbol: botData.config.symbol || "BTCUSDT",
      status: botData.status,
      config: {
        riskLevel: botData.config.riskLevel || 3,
        lotSize: botData.config.lotSize || 0.1,
        takeProfit: botData.config.takeProfit || 2,
        stopLoss: botData.config.stopLoss || 1,
        investment: botData.config.investment || 1000,
        aiRecommendations: false,
        parameters: botData.config,
      },
      credentials: {
        apiKey: "mock_api_key",
        secretKey: "mock_secret_key",
        encrypted: false,
      },
      stats: {
        totalTrades: 0,
        winningTrades: 0,
        totalProfit: 0,
        totalLoss: 0,
        winRate: 0,
        maxDrawdown: 0,
        createdAt: new Date(),
      },
      executionCount: 0,
    }

    const botId = await database.createBot(userBotData)
    const bot = await database.getBot(botId, botData.userId)

    return {
      id: botId,
      userId: botData.userId,
      name: botData.name,
      strategy: botData.strategy,
      exchange: botData.exchange,
      status: botData.status,
      subscriptionStatus: botData.subscriptionStatus,
      autoStop: botData.autoStop,
      startTime: botData.startTime,
      endTime: botData.endTime,
      config: botData.config,
      performance: botData.performance,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  static async updateBot(id: string, updates: Partial<Bot>): Promise<Bot | null> {
    const bot = await database.getBot(id, updates.userId || "")
    if (!bot) return null

    const success = await database.updateBot(id, bot.userId, updates as Partial<UserBot>)
    if (!success) return null

    const updatedBot = await database.getBot(id, bot.userId)
    if (!updatedBot) return null

    return {
      id,
      userId: updatedBot.userId,
      name: updatedBot.name,
      strategy: updatedBot.strategy,
      exchange: updatedBot.exchange,
      status: updatedBot.status,
      subscriptionStatus: "active",
      autoStop: false,
      startTime: updatedBot.createdAt,
      endTime: null,
      config: updatedBot.config,
      performance: {
        totalTrades: updatedBot.stats.totalTrades,
        profitLoss: updatedBot.stats.totalProfit - updatedBot.stats.totalLoss,
        winRate: updatedBot.stats.winRate / 100,
      },
      createdAt: updatedBot.createdAt,
      updatedAt: updatedBot.updatedAt,
    }
  }

  static async deleteBot(id: string): Promise<boolean> {
    const bot = await database.getBot(id, "")
    if (!bot) return false
    return database.deleteBot(id, bot.userId)
  }

  static async getExpiredUsers(): Promise<User[]> {
    const now = new Date()
    const allUsers = Array.from(database.users.values())
    return allUsers.filter((user) => user.subscriptionExpiry < now && user.subscriptionStatus === "active")
  }

  static async getRunningBots(): Promise<Bot[]> {
    const runningUserBots = await database.getRunningBots()
    return runningUserBots.map((bot) => ({
      id: bot._id!,
      userId: bot.userId,
      name: bot.name,
      strategy: bot.strategy,
      exchange: bot.exchange,
      status: bot.status,
      subscriptionStatus: "active",
      autoStop: false,
      startTime: bot.createdAt,
      endTime: null,
      config: bot.config,
      performance: {
        totalTrades: bot.stats.totalTrades,
        profitLoss: bot.stats.totalProfit - bot.stats.totalLoss,
        winRate: bot.stats.winRate / 100,
      },
      createdAt: bot.createdAt,
      updatedAt: bot.updatedAt,
    }))
  }
}

// Export default for compatibility
export default database
