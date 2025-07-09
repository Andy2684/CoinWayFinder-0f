import { MongoClient, type Db, ObjectId } from "mongodb"
import crypto from "crypto"

export interface UserBot {
  _id?: ObjectId
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
  _id?: ObjectId
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
  _id?: ObjectId
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
  _id?: ObjectId
  email: string
  passwordHash: string
  username: string
  subscriptionStatus: "active" | "expired" | "cancelled"
  subscriptionPlan: string
  subscriptionExpiry: Date
  createdAt: Date
  updatedAt: Date
  isAdmin?: boolean
}

export interface ArbitrageOpportunity {
  _id?: ObjectId
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
  _id?: ObjectId
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
  private client: MongoClient | null = null
  private db: Db | null = null
  private encryptionKey: string

  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || "default-key-change-in-production"
  }

  async connect(): Promise<void> {
    if (this.client && this.db) return

    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
    const dbName = process.env.MONGODB_DB || "coinwayfinder"

    this.client = new MongoClient(uri)
    await this.client.connect()
    this.db = this.client.db(dbName)

    await this.createIndexes()
    console.log("Connected to MongoDB")
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) return

    await this.db.collection("users").createIndex({ email: 1 }, { unique: true })
    await this.db.collection("users").createIndex({ verificationToken: 1 })
    await this.db.collection("bots").createIndex({ userId: 1 })
    await this.db.collection("bots").createIndex({ status: 1 })
    await this.db.collection("bots").createIndex({ strategy: 1 })
    await this.db.collection("bots").createIndex({ lastExecutedAt: 1 })
    await this.db.collection("trades").createIndex({ botId: 1 })
    await this.db.collection("trades").createIndex({ userId: 1 })
    await this.db.collection("trades").createIndex({ timestamp: -1 })
    await this.db.collection("trades").createIndex({ symbol: 1 })
    await this.db.collection("user_settings").createIndex({ userId: 1 }, { unique: true })
    await this.db.collection("user_settings").createIndex({ "referrals.referralCode": 1 }, { unique: true })
    await this.db.collection("arbitrage").createIndex({ symbol: 1 })
    await this.db.collection("arbitrage").createIndex({ timestamp: -1 })
    await this.db.collection("arbitrage").createIndex({ status: 1 })
    await this.db.collection("ai_analysis").createIndex({ userId: 1 })
    await this.db.collection("ai_analysis").createIndex({ symbol: 1 })
    await this.db.collection("ai_analysis").createIndex({ timestamp: -1 })
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
    }
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

  async createUser(user: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<string> {
    await this.connect()
    const collection = this.db!.collection<User>("users")

    const newUser: User = {
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: Date.now().toString(),
      username: user.email.split("@")[0],
      subscriptionStatus: "active",
      subscriptionPlan: "free",
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    }

    const result = await collection.insertOne(newUser)
    return result.insertedId.toString()
  }

  async getUserByEmail(email: string): Promise<User | null> {
    await this.connect()
    const collection = this.db!.collection<User>("users")
    return collection.findOne({ email })
  }

  async getUserById(userId: string): Promise<User | null> {
    await this.connect()
    const collection = this.db!.collection<User>("users")
    return collection.findOne({ _id: new ObjectId(userId) })
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    await this.connect()
    const collection = this.db!.collection<User>("users")

    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { ...updates, updatedAt: new Date() } },
    )

    return result.modifiedCount > 0
  }

  async createBot(bot: Omit<Bot, "_id" | "createdAt" | "updatedAt">): Promise<string> {
    await this.connect()
    const collection = this.db!.collection<Bot>("bots")

    const newBot: Bot = {
      ...bot,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      subscriptionStatus: "active",
    }

    const result = await collection.insertOne(newBot)
    return result.insertedId.toString()
  }

  async getBot(botId: string, userId: string): Promise<Bot | null> {
    await this.connect()
    const collection = this.db!.collection<Bot>("bots")

    return collection.findOne({ _id: new ObjectId(botId), userId })
  }

  async getUserBots(userId: string): Promise<Bot[]> {
    await this.connect()
    const collection = this.db!.collection<Bot>("bots")

    return collection.find({ userId }).toArray()
  }

  async getRunningBots(): Promise<Bot[]> {
    await this.connect()
    const collection = this.db!.collection<Bot>("bots")

    return collection.find({ status: "running" }).toArray()
  }

  async updateBot(botId: string, userId: string, updates: Partial<Bot>): Promise<boolean> {
    await this.connect()
    const collection = this.db!.collection<Bot>("bots")

    const result = await collection.updateOne(
      { _id: new ObjectId(botId), userId },
      { $set: { ...updates, updatedAt: new Date() } },
    )

    return result.modifiedCount > 0
  }

  async deleteBot(botId: string, userId: string): Promise<boolean> {
    await this.connect()
    const collection = this.db!.collection<Bot>("bots")

    const result = await collection.deleteOne({ _id: new ObjectId(botId), userId })
    return result.deletedCount > 0
  }

  async saveTrade(trade: Omit<TradeRecord, "_id">): Promise<string> {
    await this.connect()
    const collection = this.db!.collection<TradeRecord>("trades")

    const result = await collection.insertOne({
      ...trade,
      timestamp: new Date(),
    })

    return result.insertedId.toString()
  }

  async getBotTrades(botId: string, limit = 100): Promise<TradeRecord[]> {
    await this.connect()
    const collection = this.db!.collection<TradeRecord>("trades")

    return collection.find({ botId }).sort({ timestamp: -1 }).limit(limit).toArray()
  }

  async getUserTrades(userId: string, limit = 100): Promise<TradeRecord[]> {
    await this.connect()
    const collection = this.db!.collection<TradeRecord>("trades")

    return collection.find({ userId }).sort({ timestamp: -1 }).limit(limit).toArray()
  }

  async updateTradeStatus(tradeId: string, status: TradeRecord["status"], profit?: number): Promise<boolean> {
    await this.connect()
    const collection = this.db!.collection<TradeRecord>("trades")

    const updateDoc: any = { status }
    if (profit !== undefined) {
      updateDoc.profit = profit
    }

    const result = await collection.updateOne({ _id: new ObjectId(tradeId) }, { $set: updateDoc })

    return result.modifiedCount > 0
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    await this.connect()
    const collection = this.db!.collection<UserSettings>("user_settings")

    return collection.findOne({ userId })
  }

  async saveUserSettings(settings: Omit<UserSettings, "_id">): Promise<string> {
    await this.connect()
    const collection = this.db!.collection<UserSettings>("user_settings")

    const result = await collection.replaceOne(
      { userId: settings.userId },
      { ...settings, updatedAt: new Date() },
      { upsert: true },
    )

    return result.upsertedId?.toString() || settings.userId
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

    const userSettings: Omit<UserSettings, "_id"> = {
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
    return userSettings as UserSettings
  }

  private async addReferralBonus(referrerId: string, newUserId: string): Promise<void> {
    await this.connect()
    const collection = this.db!.collection<UserSettings>("user_settings")

    await collection.updateOne(
      { userId: referrerId },
      {
        $push: { "referrals.referredUsers": newUserId },
        $inc: { "referrals.bonusDays": 5 },
        $set: { updatedAt: new Date() },
      },
    )
  }

  async saveArbitrageOpportunity(opportunity: Omit<ArbitrageOpportunity, "_id">): Promise<string> {
    await this.connect()
    const collection = this.db!.collection<ArbitrageOpportunity>("arbitrage")

    const result = await collection.insertOne({
      ...opportunity,
      timestamp: new Date(),
    })

    return result.insertedId.toString()
  }

  async getArbitrageOpportunities(minProfitPercent = 1, limit = 50): Promise<ArbitrageOpportunity[]> {
    await this.connect()
    const collection = this.db!.collection<ArbitrageOpportunity>("arbitrage")

    return collection
      .find({
        status: "active",
        profitPercent: { $gte: minProfitPercent },
        timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
      })
      .sort({ profitPercent: -1 })
      .limit(limit)
      .toArray()
  }

  async saveAIAnalysis(analysis: Omit<AIAnalysis, "_id">): Promise<string> {
    await this.connect()
    const collection = this.db!.collection<AIAnalysis>("ai_analysis")

    const result = await collection.insertOne({
      ...analysis,
      timestamp: new Date(),
    })

    return result.insertedId.toString()
  }

  async getLatestAIAnalysis(userId: string, symbol: string): Promise<AIAnalysis | null> {
    await this.connect()
    const collection = this.db!.collection<AIAnalysis>("ai_analysis")

    return collection.findOne({ userId, symbol }, { sort: { timestamp: -1 } })
  }

  async getBotPerformance(botId: string): Promise<{
    totalTrades: number
    totalProfit: number
    winRate: number
    avgProfit: number
    maxDrawdown: number
    profitByDay: Array<{ date: string; profit: number }>
  }> {
    await this.connect()
    const collection = this.db!.collection<TradeRecord>("trades")

    const trades = await collection
      .find({
        botId,
        status: "filled",
        profit: { $exists: true },
      })
      .toArray()

    if (trades.length === 0) {
      return {
        totalTrades: 0,
        totalProfit: 0,
        winRate: 0,
        avgProfit: 0,
        maxDrawdown: 0,
        profitByDay: [],
      }
    }

    const totalProfit = trades.reduce((sum, trade) => sum + (trade.profit || 0), 0)
    const winningTrades = trades.filter((trade) => (trade.profit || 0) > 0)
    const winRate = (winningTrades.length / trades.length) * 100
    const avgProfit = totalProfit / trades.length

    let maxDrawdown = 0
    let peak = 0
    let runningProfit = 0

    trades.forEach((trade) => {
      runningProfit += trade.profit || 0
      if (runningProfit > peak) {
        peak = runningProfit
      }
      const drawdown = peak - runningProfit
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    })

    const profitByDay = new Map<string, number>()
    trades.forEach((trade) => {
      const date = trade.timestamp.toISOString().split("T")[0]
      profitByDay.set(date, (profitByDay.get(date) || 0) + (trade.profit || 0))
    })

    return {
      totalTrades: trades.length,
      totalProfit,
      winRate,
      avgProfit,
      maxDrawdown,
      profitByDay: Array.from(profitByDay.entries()).map(([date, profit]) => ({ date, profit })),
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

    const botsCollection = this.db!.collection<Bot>("bots")
    const tradesCollection = this.db!.collection<TradeRecord>("trades")

    const bots = await botsCollection.find({ userId }).toArray()
    const trades = await tradesCollection
      .find({
        userId,
        status: "filled",
        profit: { $exists: true },
      })
      .toArray()

    const totalProfit = trades.reduce((sum, trade) => sum + (trade.profit || 0), 0)
    const winningTrades = trades.filter((trade) => (trade.profit || 0) > 0)
    const avgWinRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0
    const totalInvestment = bots.reduce((sum, bot) => sum + bot.config.investment, 0)

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const dailyTrades = trades.filter((trade) => trade.timestamp >= yesterday)
    const dailyPnL = dailyTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0)

    return {
      totalBots: bots.length,
      activeBots: bots.filter((bot) => bot.status === "running").length,
      totalProfit,
      totalTrades: trades.length,
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

    const pipeline = [
      { $match: { userId } },
      {
        $lookup: {
          from: "trades",
          localField: "_id",
          foreignField: "botId",
          as: "trades",
        },
      },
      {
        $addFields: {
          totalProfit: {
            $sum: {
              $map: {
                input: "$trades",
                as: "trade",
                in: { $ifNull: ["$$trade.profit", 0] },
              },
            },
          },
          winningTrades: {
            $size: {
              $filter: {
                input: "$trades",
                as: "trade",
                cond: { $gt: [{ $ifNull: ["$$trade.profit", 0] }, 0] },
              },
            },
          },
          totalTrades: { $size: "$trades" },
        },
      },
      {
        $addFields: {
          winRate: {
            $cond: {
              if: { $gt: ["$totalTrades", 0] },
              then: { $multiply: [{ $divide: ["$winningTrades", "$totalTrades"] }, 100] },
              else: 0,
            },
          },
        },
      },
      { $sort: { totalProfit: -1 } },
      { $limit: limit },
      {
        $project: {
          botId: { $toString: "$_id" },
          name: 1,
          strategy: 1,
          profit: "$totalProfit",
          winRate: 1,
          trades: "$totalTrades",
        },
      },
    ]

    return this.db!.collection("bots").aggregate(pipeline).toArray()
  }

  async getExpiredSubscriptions(): Promise<UserSettings[]> {
    await this.connect()
    const collection = this.db!.collection<UserSettings>("user_settings")

    const now = new Date()
    return collection
      .find({
        "subscription.endDate": { $lt: now },
        "subscription.status": "active",
      })
      .toArray()
  }

  async updateSubscriptionStatus(userId: string, status: "active" | "expired" | "cancelled"): Promise<boolean> {
    await this.connect()
    const collection = this.db!.collection<UserSettings>("user_settings")

    const result = await collection.updateOne(
      { userId },
      {
        $set: {
          "subscription.status": status,
          updatedAt: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  }

  async stopUserBots(userId: string, reason: string): Promise<number> {
    await this.connect()
    const collection = this.db!.collection<Bot>("bots")

    const result = await collection.updateMany(
      { userId, status: "running" },
      {
        $set: {
          status: "stopped",
          lastError: reason,
          lastErrorAt: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    return result.modifiedCount
  }
}

// Mock database implementation for development
class MockDatabase {
  private users: Map<string, User> = new Map()
  private bots: Map<string, Bot> = new Map()
  private trades: Map<string, TradeRecord> = new Map()

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    // Create admin user
    const adminUser: User = {
      id: "admin_001",
      email: "project.command.center@gmail.com",
      passwordHash: "$2a$10$hashedPasswordForAdmin", // bcrypt hash of "CoinWayFinder2024!"
      username: "Admin User",
      subscriptionStatus: "active",
      subscriptionPlan: "enterprise",
      subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      createdAt: new Date(),
      updatedAt: new Date(),
      isAdmin: true,
    }

    // Create sample users
    const sampleUsers: User[] = [
      {
        id: "user_001",
        email: "john@example.com",
        passwordHash: "$2a$10$hashedPasswordForJohn",
        username: "John Doe",
        subscriptionStatus: "active",
        subscriptionPlan: "pro",
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "user_002",
        email: "jane@example.com",
        passwordHash: "$2a$10$hashedPasswordForJane",
        username: "Jane Smith",
        subscriptionStatus: "expired",
        subscriptionPlan: "starter",
        subscriptionExpiry: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        createdAt: new Date(),
        updatedAt: new Date(),
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
  }

  // User operations
  async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const user: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
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

  // Bot operations
  async createBot(botData: Omit<Bot, "id" | "createdAt" | "updatedAt">): Promise<Bot> {
    const bot: Bot = {
      ...botData,
      id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
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
  async createTrade(tradeData: Omit<TradeRecord, "id">): Promise<TradeRecord> {
    const trade: TradeRecord = {
      ...tradeData,
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
    this.trades.set(trade.id, trade)
    return trade
  }

  async getTradesByBotId(botId: string): Promise<TradeRecord[]> {
    return Array.from(this.trades.values()).filter((trade) => trade.botId === botId)
  }

  async getTradesByUserId(userId: string): Promise<TradeRecord[]> {
    return Array.from(this.trades.values()).filter((trade) => trade.userId === userId)
  }

  // Subscription management
  async updateUserSubscription(
    userId: string,
    subscriptionData: {
      status: "active" | "expired" | "cancelled"
      plan: string
      expiry: Date
    },
  ): Promise<User | null> {
    const user = this.users.get(userId)
    if (!user) return null

    const updatedUser = {
      ...user,
      subscriptionStatus: subscriptionData.status,
      subscriptionPlan: subscriptionData.plan,
      subscriptionExpiry: subscriptionData.expiry,
      updatedAt: new Date(),
    }
    this.users.set(userId, updatedUser)

    // Update bot subscription status for graceful expiration
    const userBots = await this.getBotsByUserId(userId)
    for (const bot of userBots) {
      await this.updateBot(bot.id, {
        subscriptionStatus: subscriptionData.status,
      })
    }

    return updatedUser
  }

  async getExpiredUsers(): Promise<User[]> {
    const now = new Date()
    return Array.from(this.users.values()).filter((user) => user.subscriptionExpiry && user.subscriptionExpiry < now)
  }

  async getRunningBotsForExpiredUsers(): Promise<Bot[]> {
    const expiredUsers = await this.getExpiredUsers()
    const expiredUserIds = expiredUsers.map((user) => user.id)

    return Array.from(this.bots.values()).filter(
      (bot) => expiredUserIds.includes(bot.userId) && bot.status === "running" && bot.subscriptionStatus === "expired",
    )
  }

  // Statistics
  async getStats(): Promise<{
    totalUsers: number
    activeUsers: number
    expiredUsers: number
    totalBots: number
    runningBots: number
    totalTrades: number
  }> {
    const users = Array.from(this.users.values())
    const bots = Array.from(this.bots.values())
    const trades = Array.from(this.trades.values())

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.subscriptionStatus === "active").length,
      expiredUsers: users.filter((u) => u.subscriptionStatus === "expired").length,
      totalBots: bots.length,
      runningBots: bots.filter((b) => b.status === "running").length,
      totalTrades: trades.length,
    }
  }
}

// Create singleton instance
export const Database = new MockDatabase()

// Export default for compatibility
export default Database
