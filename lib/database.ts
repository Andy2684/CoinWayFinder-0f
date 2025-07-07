import { MongoClient, type Db } from "mongodb"
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
    parameters: Record<string, any>
  }
  credentials: {
    apiKey: string
    secretKey: string
    encrypted: boolean
  }
  stats: {
    totalTrades: number
    winningTrades: number
    totalProfit: number
    totalLoss: number
    winRate: number
    createdAt: Date
    lastTradeAt?: Date
  }
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
}

export interface UserSettings {
  _id?: string
  userId: string
  preferences: {
    notifications: {
      email: boolean
      telegram: boolean
      webhooks: boolean
    }
    riskManagement: {
      maxDailyLoss: number
      maxPositionSize: number
      emergencyStop: boolean
    }
    ui: {
      theme: "dark" | "light"
      currency: "USD" | "BTC" | "ETH"
    }
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

    console.log("Connected to MongoDB")
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

  // Bot Management
  async createBot(bot: Omit<UserBot, "_id" | "createdAt" | "updatedAt">): Promise<string> {
    await this.connect()
    const collection = this.db!.collection<UserBot>("bots")

    const encryptedBot: UserBot = {
      ...bot,
      credentials: {
        ...bot.credentials,
        apiKey: this.encrypt(bot.credentials.apiKey),
        secretKey: this.encrypt(bot.credentials.secretKey),
        encrypted: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(encryptedBot)
    return result.insertedId.toString()
  }

  async getBot(botId: string, userId: string): Promise<UserBot | null> {
    await this.connect()
    const collection = this.db!.collection<UserBot>("bots")

    const bot = await collection.findOne({ _id: botId as any, userId })
    if (!bot) return null

    // Decrypt credentials
    if (bot.credentials.encrypted) {
      bot.credentials.apiKey = this.decrypt(bot.credentials.apiKey)
      bot.credentials.secretKey = this.decrypt(bot.credentials.secretKey)
      bot.credentials.encrypted = false
    }

    return bot
  }

  async getUserBots(userId: string): Promise<UserBot[]> {
    await this.connect()
    const collection = this.db!.collection<UserBot>("bots")

    const bots = await collection.find({ userId }).toArray()

    // Decrypt credentials for each bot
    return bots.map((bot) => {
      if (bot.credentials.encrypted) {
        bot.credentials.apiKey = this.decrypt(bot.credentials.apiKey)
        bot.credentials.secretKey = this.decrypt(bot.credentials.secretKey)
        bot.credentials.encrypted = false
      }
      return bot
    })
  }

  async updateBot(botId: string, userId: string, updates: Partial<UserBot>): Promise<boolean> {
    await this.connect()
    const collection = this.db!.collection<UserBot>("bots")

    const updateDoc: any = { ...updates, updatedAt: new Date() }

    // Encrypt credentials if they're being updated
    if (updates.credentials) {
      updateDoc.credentials = {
        ...updates.credentials,
        apiKey: this.encrypt(updates.credentials.apiKey),
        secretKey: this.encrypt(updates.credentials.secretKey),
        encrypted: true,
      }
    }

    const result = await collection.updateOne({ _id: botId as any, userId }, { $set: updateDoc })

    return result.modifiedCount > 0
  }

  async deleteBot(botId: string, userId: string): Promise<boolean> {
    await this.connect()
    const collection = this.db!.collection<UserBot>("bots")

    const result = await collection.deleteOne({ _id: botId as any, userId })
    return result.deletedCount > 0
  }

  // Trade Records
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

    const result = await collection.updateOne({ _id: tradeId as any }, { $set: updateDoc })

    return result.modifiedCount > 0
  }

  // User Settings
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

  // Analytics
  async getBotPerformance(botId: string): Promise<{
    totalTrades: number
    totalProfit: number
    winRate: number
    avgProfit: number
    maxDrawdown: number
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
      }
    }

    const totalProfit = trades.reduce((sum, trade) => sum + (trade.profit || 0), 0)
    const winningTrades = trades.filter((trade) => (trade.profit || 0) > 0)
    const winRate = (winningTrades.length / trades.length) * 100
    const avgProfit = totalProfit / trades.length

    // Calculate max drawdown
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

    return {
      totalTrades: trades.length,
      totalProfit,
      winRate,
      avgProfit,
      maxDrawdown,
    }
  }

  async getPortfolioStats(userId: string): Promise<{
    totalBots: number
    activeBots: number
    totalProfit: number
    totalTrades: number
    avgWinRate: number
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

    return {
      totalBots: bots.length,
      activeBots: bots.filter((bot) => bot.status === "running").length,
      totalProfit,
      totalTrades: trades.length,
      avgWinRate,
    }
  }
}

export const database = new DatabaseManager()
