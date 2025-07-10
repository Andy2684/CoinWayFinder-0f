import { MongoClient, type Db } from "mongodb"

const uri = process.env.DATABASE_URL || process.env.MONGODB_URI || ""
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!uri) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function connectToDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db("coinwayfinder")
}

export default clientPromise

let db: Db

async function createIndexes() {
  try {
    const database = await connectToDatabase()

    // Users collection indexes
    await database.collection("users").createIndex({ email: 1 }, { unique: true })
    await database.collection("users").createIndex({ username: 1 }, { unique: true })
    await database.collection("users").createIndex({ isActive: 1 })
    await database.collection("users").createIndex({ "subscription.status": 1 })

    // Admins collection indexes
    await database.collection("admins").createIndex({ username: 1 }, { unique: true })

    // Bots collection indexes
    await database.collection("bots").createIndex({ userId: 1 })
    await database.collection("bots").createIndex({ status: 1 })
    await database.collection("bots").createIndex({ strategy: 1 })

    // Trades collection indexes
    await database.collection("trades").createIndex({ userId: 1 })
    await database.collection("trades").createIndex({ botId: 1 })
    await database.collection("trades").createIndex({ timestamp: -1 })
    await database.collection("trades").createIndex({ symbol: 1 })

    // API Keys collection indexes
    await database.collection("apiKeys").createIndex({ userId: 1 })
    await database.collection("apiKeys").createIndex({ keyHash: 1 }, { unique: true })
    await database.collection("apiKeys").createIndex({ isActive: 1 })

    console.log("Database indexes created successfully")
  } catch (error) {
    console.error("Error creating indexes:", error)
  }
}

export interface UserDocument {
  _id: string
  email: string
  username: string
  password: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  subscription: {
    plan: "free" | "starter" | "pro" | "enterprise"
    status: "active" | "inactive" | "cancelled" | "past_due"
    trialEndsAt?: Date
    currentPeriodEnd?: Date
    stripeCustomerId?: string
    stripeSubscriptionId?: string
  }
  profile: {
    firstName?: string
    lastName?: string
    avatar?: string
    timezone?: string
    notifications: {
      email: boolean
      telegram: boolean
      push: boolean
    }
  }
  settings: {
    theme: "light" | "dark" | "system"
    language: string
    currency: string
    riskTolerance: "low" | "medium" | "high"
  }
  stats: {
    totalTrades: number
    totalProfit: number
    totalLoss: number
    winRate: number
    lastActiveAt: Date
  }
}

export interface BotDocument {
  _id: string
  userId: string
  name: string
  description?: string
  strategy: string
  status: "active" | "paused" | "stopped" | "error"
  config: {
    symbol: string
    exchange: string
    amount: number
    stopLoss?: number
    takeProfit?: number
    maxTrades?: number
    riskPerTrade?: number
    [key: string]: any
  }
  performance: {
    totalTrades: number
    winningTrades: number
    losingTrades: number
    totalProfit: number
    totalLoss: number
    winRate: number
    maxDrawdown: number
    sharpeRatio?: number
  }
  createdAt: Date
  updatedAt: Date
  lastRunAt?: Date
  nextRunAt?: Date
  errorMessage?: string
}

export interface TradeDocument {
  _id: string
  userId: string
  botId: string
  symbol: string
  exchange: string
  type: "buy" | "sell"
  side: "long" | "short"
  amount: number
  price: number
  fee: number
  status: "pending" | "filled" | "cancelled" | "failed"
  timestamp: Date
  orderId?: string
  profit?: number
  loss?: number
  metadata: {
    strategy: string
    signal: string
    confidence: number
    [key: string]: any
  }
}

export interface ApiKeyDocument {
  _id: string
  userId: string
  name: string
  keyHash: string
  permissions: string[]
  isActive: boolean
  lastUsedAt?: Date
  expiresAt?: Date
  createdAt: Date
  rateLimit: {
    requestsPerMinute: number
    requestsPerHour: number
    requestsPerDay: number
  }
  usage: {
    totalRequests: number
    lastRequestAt?: Date
    requestsToday: number
    requestsThisHour: number
    requestsThisMinute: number
  }
}

export interface UserSettingsDocument {
  _id: string
  userId: string
  exchanges: {
    [exchange: string]: {
      apiKey: string
      apiSecret: string
      passphrase?: string
      sandbox: boolean
      isActive: boolean
    }
  }
  notifications: {
    email: {
      enabled: boolean
      tradeAlerts: boolean
      profitLoss: boolean
      systemUpdates: boolean
    }
    telegram: {
      enabled: boolean
      chatId?: string
      botToken?: string
      tradeAlerts: boolean
      profitLoss: boolean
    }
    webhook: {
      enabled: boolean
      url?: string
      secret?: string
      events: string[]
    }
  }
  trading: {
    defaultRiskPerTrade: number
    maxConcurrentTrades: number
    allowedSymbols: string[]
    blockedSymbols: string[]
    tradingHours: {
      enabled: boolean
      start: string
      end: string
      timezone: string
    }
  }
  createdAt: Date
  updatedAt: Date
}

export class Database {
  private db: Db | null = null

  constructor() {
    this.initialize()
  }

  private async initialize() {
    this.db = await connectToDatabase()
    await createIndexes()
  }

  private async getDb(): Promise<Db> {
    if (!this.db) {
      this.db = await connectToDatabase()
    }
    return this.db
  }

  // User operations
  async createUser(userData: Partial<UserDocument>): Promise<UserDocument> {
    const db = await this.getDb()
    const collection = db.collection<UserDocument>("users")
    const userId = new Date().getTime().toString()

    const user: UserDocument = {
      _id: userId,
      email: userData.email!,
      username: userData.username!,
      password: userData.password!,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      subscription: {
        plan: "free",
        status: "active",
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      profile: {
        notifications: {
          email: true,
          telegram: false,
          push: true,
        },
      },
      settings: {
        theme: "system",
        language: "en",
        currency: "USD",
        riskTolerance: "medium",
      },
      stats: {
        totalTrades: 0,
        totalProfit: 0,
        totalLoss: 0,
        winRate: 0,
        lastActiveAt: new Date(),
      },
      ...userData,
    }

    await collection.insertOne(user)
    return user
  }

  async getUserById(userId: string): Promise<UserDocument | null> {
    const db = await this.getDb()
    const collection = db.collection<UserDocument>("users")
    return collection.findOne({ _id: userId, isActive: true })
  }

  async getUserByEmail(email: string): Promise<UserDocument | null> {
    const db = await this.getDb()
    const collection = db.collection<UserDocument>("users")
    return collection.findOne({ email, isActive: true })
  }

  async getUserByUsername(username: string): Promise<UserDocument | null> {
    const db = await this.getDb()
    const collection = db.collection<UserDocument>("users")
    return collection.findOne({ username, isActive: true })
  }

  async updateUser(userId: string, updates: Partial<UserDocument>): Promise<boolean> {
    const db = await this.getDb()
    const collection = db.collection<UserDocument>("users")
    const result = await collection.updateOne({ _id: userId }, { $set: { ...updates, updatedAt: new Date() } })
    return result.modifiedCount > 0
  }

  async deleteUser(userId: string): Promise<boolean> {
    const db = await this.getDb()
    const collection = db.collection<UserDocument>("users")
    const result = await collection.updateOne({ _id: userId }, { $set: { isActive: false, updatedAt: new Date() } })
    return result.modifiedCount > 0
  }

  // Bot operations
  async createBot(botData: Partial<BotDocument>): Promise<BotDocument> {
    const db = await this.getDb()
    const collection = db.collection<BotDocument>("bots")
    const botId = new Date().getTime().toString()

    const bot: BotDocument = {
      _id: botId,
      userId: botData.userId!,
      name: botData.name!,
      description: botData.description,
      strategy: botData.strategy!,
      status: "stopped",
      config: botData.config!,
      performance: {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalProfit: 0,
        totalLoss: 0,
        winRate: 0,
        maxDrawdown: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...botData,
    }

    await collection.insertOne(bot)
    return bot
  }

  async getBotById(botId: string): Promise<BotDocument | null> {
    const db = await this.getDb()
    const collection = db.collection<BotDocument>("bots")
    return collection.findOne({ _id: botId })
  }

  async getBotsByUserId(userId: string): Promise<BotDocument[]> {
    const db = await this.getDb()
    const collection = db.collection<BotDocument>("bots")
    return collection.find({ userId }).toArray()
  }

  async updateBot(botId: string, updates: Partial<BotDocument>): Promise<boolean> {
    const db = await this.getDb()
    const collection = db.collection<BotDocument>("bots")
    const result = await collection.updateOne({ _id: botId }, { $set: { ...updates, updatedAt: new Date() } })
    return result.modifiedCount > 0
  }

  async deleteBot(botId: string): Promise<boolean> {
    const db = await this.getDb()
    const collection = db.collection<BotDocument>("bots")
    const result = await collection.deleteOne({ _id: botId })
    return result.deletedCount > 0
  }

  // Trade operations
  async createTrade(tradeData: Partial<TradeDocument>): Promise<TradeDocument> {
    const db = await this.getDb()
    const collection = db.collection<TradeDocument>("trades")
    const tradeId = new Date().getTime().toString()

    const trade: TradeDocument = {
      _id: tradeId,
      userId: tradeData.userId!,
      botId: tradeData.botId!,
      symbol: tradeData.symbol!,
      exchange: tradeData.exchange!,
      type: tradeData.type!,
      side: tradeData.side!,
      amount: tradeData.amount!,
      price: tradeData.price!,
      fee: tradeData.fee || 0,
      status: "pending",
      timestamp: new Date(),
      metadata: tradeData.metadata || {
        strategy: "",
        signal: "",
        confidence: 0,
      },
      ...tradeData,
    }

    await collection.insertOne(trade)
    return trade
  }

  async getTradeById(tradeId: string): Promise<TradeDocument | null> {
    const db = await this.getDb()
    const collection = db.collection<TradeDocument>("trades")
    return collection.findOne({ _id: tradeId })
  }

  async getTradesByUserId(userId: string, limit = 100): Promise<TradeDocument[]> {
    const db = await this.getDb()
    const collection = db.collection<TradeDocument>("trades")
    return collection.find({ userId }).sort({ timestamp: -1 }).limit(limit).toArray()
  }

  async getTradesByBotId(botId: string, limit = 100): Promise<TradeDocument[]> {
    const db = await this.getDb()
    const collection = db.collection<TradeDocument>("trades")
    return collection.find({ botId }).sort({ timestamp: -1 }).limit(limit).toArray()
  }

  async updateTrade(tradeId: string, updates: Partial<TradeDocument>): Promise<boolean> {
    const db = await this.getDb()
    const collection = db.collection<TradeDocument>("trades")
    const result = await collection.updateOne({ _id: tradeId }, { $set: updates })
    return result.modifiedCount > 0
  }

  // Analytics and statistics
  async getUserStats(userId: string): Promise<any> {
    const db = await this.getDb()
    const tradesCollection = db.collection<TradeDocument>("trades")
    const botsCollection = db.collection<BotDocument>("bots")

    const [trades, bots] = await Promise.all([
      tradesCollection.find({ userId }).toArray(),
      botsCollection.find({ userId }).toArray(),
    ])

    const totalTrades = trades.length
    const filledTrades = trades.filter((t) => t.status === "filled")
    const profitableTrades = filledTrades.filter((t) => (t.profit || 0) > 0)

    const totalProfit = filledTrades.reduce((sum, t) => sum + (t.profit || 0), 0)
    const totalLoss = filledTrades.reduce((sum, t) => sum + (t.loss || 0), 0)
    const winRate = filledTrades.length > 0 ? (profitableTrades.length / filledTrades.length) * 100 : 0

    return {
      totalTrades,
      totalBots: bots.length,
      activeBots: bots.filter((b) => b.status === "active").length,
      totalProfit,
      totalLoss,
      netProfit: totalProfit - totalLoss,
      winRate,
      avgTradeSize:
        filledTrades.length > 0 ? filledTrades.reduce((sum, t) => sum + t.amount, 0) / filledTrades.length : 0,
    }
  }

  async getSystemStats(): Promise<any> {
    const db = await this.getDb()
    const usersCollection = db.collection<UserDocument>("users")
    const botsCollection = db.collection<BotDocument>("bots")
    const tradesCollection = db.collection<TradeDocument>("trades")

    const [totalUsers, totalBots, totalTrades] = await Promise.all([
      usersCollection.countDocuments({ isActive: true }),
      botsCollection.countDocuments(),
      tradesCollection.countDocuments(),
    ])

    const activeUsers = await usersCollection.countDocuments({
      isActive: true,
      "stats.lastActiveAt": { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })

    const activeBots = await botsCollection.countDocuments({ status: "active" })

    return {
      totalUsers,
      activeUsers,
      totalBots,
      activeBots,
      totalTrades,
    }
  }

  // Cleanup operations
  async cleanup(): Promise<void> {
    if (client) {
      await client.close()
    }
  }
}

// Create and export the database instance
export const database = new Database()
