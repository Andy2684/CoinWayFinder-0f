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
  password: string
  name: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  isVerified: boolean
  verificationToken?: string
  id: string
  username: string
  subscriptionStatus: "active" | "expired" | "cancelled"
  subscriptionPlan: "free" | "pro" | "enterprise"
  subscriptionExpiry?: Date
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
  status: "running" | "stopped" | "paused"
  autoStop: boolean
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
      subscriptionExpiry: undefined,
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

  async createBot(bot: Omit<UserBot, "_id" | "createdAt" | "updatedAt">): Promise<string> {
    await this.connect()
    const collection = this.db!.collection<UserBot>("bots")

    const encryptedBot: UserBot = {
      ...bot,
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

    const result = await collection.insertOne(encryptedBot)
    return result.insertedId.toString()
  }

  async getBot(botId: string, userId: string): Promise<UserBot | null> {
    await this.connect()
    const collection = this.db!.collection<UserBot>("bots")

    const bot = await collection.findOne({ _id: new ObjectId(botId), userId })
    if (!bot) return null

    if (bot.credentials.encrypted) {
      bot.credentials.apiKey = this.decrypt(bot.credentials.apiKey)
      bot.credentials.secretKey = this.decrypt(bot.credentials.secretKey)
      if (bot.credentials.passphrase) {
        bot.credentials.passphrase = this.decrypt(bot.credentials.passphrase)
      }
      bot.credentials.encrypted = false
    }

    return bot
  }

  async getUserBots(userId: string): Promise<UserBot[]> {
    await this.connect()
    const collection = this.db!.collection<UserBot>("bots")

    const bots = await collection.find({ userId }).toArray()

    return bots.map((bot) => {
      if (bot.credentials.encrypted) {
        bot.credentials.apiKey = this.decrypt(bot.credentials.apiKey)
        bot.credentials.secretKey = this.decrypt(bot.credentials.secretKey)
        if (bot.credentials.passphrase) {
          bot.credentials.passphrase = this.decrypt(bot.credentials.passphrase)
        }
        bot.credentials.encrypted = false
      }
      return bot
    })
  }

  async getRunningBots(): Promise<UserBot[]> {
    await this.connect()
    const collection = this.db!.collection<UserBot>("bots")

    const bots = await collection.find({ status: "running" }).toArray()

    return bots.map((bot) => {
      if (bot.credentials.encrypted) {
        bot.credentials.apiKey = this.decrypt(bot.credentials.apiKey)
        bot.credentials.secretKey = this.decrypt(bot.credentials.secretKey)
        if (bot.credentials.passphrase) {
          bot.credentials.passphrase = this.decrypt(bot.credentials.passphrase)
        }
        bot.credentials.encrypted = false
      }
      return bot
    })
  }

  async updateBot(botId: string, userId: string, updates: Partial<UserBot>): Promise<boolean> {
    await this.connect()
    const collection = this.db!.collection<UserBot>("bots")

    const updateDoc: any = { ...updates, updatedAt: new Date() }

    if (updates.credentials) {
      updateDoc.credentials = {
        ...updates.credentials,
        apiKey: this.encrypt(updates.credentials.apiKey),
        secretKey: this.encrypt(updates.credentials.secretKey),
        passphrase: updates.credentials.passphrase ? this.encrypt(updates.credentials.passphrase) : undefined,
        encrypted: true,
      }
    }

    if (updates.lastExecutedAt) {
      updateDoc.$inc = { executionCount: 1 }
    }

    const result = await collection.updateOne({ _id: new ObjectId(botId), userId }, { $set: updateDoc })

    return result.modifiedCount > 0
  }

  async deleteBot(botId: string, userId: string): Promise<boolean> {
    await this.connect()
    const collection = this.db!.collection<UserBot>("bots")

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

    const botsCollection = this.db!.collection<UserBot>("bots")
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
    const collection = this.db!.collection<UserBot>("bots")

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
const mockUsers: User[] = [
  {
    id: "1",
    email: "user@example.com",
    username: "testuser",
    subscriptionStatus: "active",
    subscriptionPlan: "pro",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockBots: Bot[] = [
  {
    id: "1",
    userId: "1",
    name: "DCA Bot",
    strategy: "dca",
    status: "running",
    autoStop: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export class Database {
  static async connect() {
    console.log("📊 Connected to mock database")
    return true
  }

  static async disconnect() {
    console.log("📊 Disconnected from mock database")
    return true
  }

  static async getUser(id: string): Promise<User | null> {
    return mockUsers.find((user) => user.id === id) || null
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return mockUsers.find((user) => user.email === email) || null
  }

  static async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const user: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockUsers.push(user)
    return user
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = mockUsers.findIndex((user) => user.id === id)
    if (userIndex === -1) return null

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updates,
      updatedAt: new Date(),
    }
    return mockUsers[userIndex]
  }

  static async getUserBots(userId: string): Promise<Bot[]> {
    return mockBots.filter((bot) => bot.userId === userId)
  }

  static async createBot(botData: Omit<Bot, "id" | "createdAt" | "updatedAt">): Promise<Bot> {
    const bot: Bot = {
      ...botData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockBots.push(bot)
    return bot
  }

  static async updateBot(id: string, updates: Partial<Bot>): Promise<Bot | null> {
    const botIndex = mockBots.findIndex((bot) => bot.id === id)
    if (botIndex === -1) return null

    mockBots[botIndex] = {
      ...mockBots[botIndex],
      ...updates,
      updatedAt: new Date(),
    }
    return mockBots[botIndex]
  }

  static async deleteBot(id: string): Promise<boolean> {
    const botIndex = mockBots.findIndex((bot) => bot.id === id)
    if (botIndex === -1) return false

    mockBots.splice(botIndex, 1)
    return true
  }

  static async getExpiredUsers(): Promise<User[]> {
    return mockUsers.filter(
      (user) =>
        user.subscriptionStatus === "expired" || (user.subscriptionExpiry && user.subscriptionExpiry < new Date()),
    )
  }

  static async getRunningBots(): Promise<Bot[]> {
    return mockBots.filter((bot) => bot.status === "running")
  }
}

export const database = new DatabaseManager()

export const connectToDatabase = async () => {
  await database.connect()
  return database
}
