import { MongoClient, type Db, type Collection, ObjectId } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.DB_NAME || "coinwayfinder"

interface User {
  _id?: ObjectId
  email: string
  username: string
  password: string
  createdAt: Date
  lastLoginAt?: Date
  emailVerified?: boolean
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  isActive?: boolean
}

interface UserSettings {
  _id?: ObjectId
  userId: string
  subscription: {
    plan: string
    status: string
    startDate?: Date
    endDate?: Date
    stripeCustomerId?: string
    stripeSubscriptionId?: string
  }
  trial: {
    hasUsed: boolean
    isActive: boolean
    startDate?: Date
    endDate?: Date
  }
  notifications: {
    email: boolean
    telegram: boolean
    push: boolean
  }
  preferences: {
    theme: string
    currency: string
    timezone: string
  }
  apiKeys?: Array<{
    id: string
    name: string
    key: string
    permissions: string[]
    createdAt: Date
    lastUsedAt?: Date
    isActive: boolean
  }>
}

interface Bot {
  _id?: ObjectId
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
  updatedAt: Date
}

interface Trade {
  _id?: ObjectId
  userId: string
  botId: string
  exchange: string
  symbol: string
  side: "buy" | "sell"
  amount: number
  price: number
  fee: number
  pnl?: number
  timestamp: Date
  orderId: string
  status: "pending" | "filled" | "cancelled"
}

class Database {
  private client: MongoClient | null = null
  private db: Db | null = null

  async connect(): Promise<void> {
    if (this.client) return

    try {
      this.client = new MongoClient(MONGODB_URI)
      await this.client.connect()
      this.db = this.client.db(DB_NAME)
      console.log("Connected to MongoDB")
    } catch (error) {
      console.error("MongoDB connection error:", error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
    }
  }

  private async getCollection<T>(name: string): Promise<Collection<T>> {
    if (!this.db) {
      await this.connect()
    }
    return this.db!.collection<T>(name)
  }

  // User operations
  async createUser(userData: Omit<User, "_id">): Promise<User> {
    const users = await this.getCollection<User>("users")
    const result = await users.insertOne({
      ...userData,
      createdAt: new Date(),
      isActive: true,
    })

    const user = await users.findOne({ _id: result.insertedId })
    if (!user) throw new Error("Failed to create user")
    return user
  }

  async getUserById(userId: string): Promise<User | null> {
    const users = await this.getCollection<User>("users")
    return users.findOne({ _id: new ObjectId(userId) })
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getCollection<User>("users")
    return users.findOne({ email })
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const users = await this.getCollection<User>("users")
    await users.updateOne({ _id: new ObjectId(userId) }, { $set: { ...updates, updatedAt: new Date() } })
  }

  async deleteUser(userId: string): Promise<void> {
    const users = await this.getCollection<User>("users")
    await users.deleteOne({ _id: new ObjectId(userId) })
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.getCollection<User>("users")
    return users.find({}).toArray()
  }

  // User Settings operations
  async createUserSettings(settingsData: Omit<UserSettings, "_id">): Promise<UserSettings> {
    const settings = await this.getCollection<UserSettings>("userSettings")
    const result = await settings.insertOne(settingsData)

    const userSettings = await settings.findOne({ _id: result.insertedId })
    if (!userSettings) throw new Error("Failed to create user settings")
    return userSettings
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const settings = await this.getCollection<UserSettings>("userSettings")
    return settings.findOne({ userId })
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<void> {
    const settings = await this.getCollection<UserSettings>("userSettings")
    await settings.updateOne({ userId }, { $set: updates }, { upsert: true })
  }

  async createUserWithTrial(userId: string): Promise<UserSettings> {
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 14) // 14-day trial

    const userSettings: Omit<UserSettings, "_id"> = {
      userId,
      subscription: {
        plan: "free",
        status: "trial",
        startDate: new Date(),
        endDate: trialEndDate,
      },
      trial: {
        hasUsed: true,
        isActive: true,
        startDate: new Date(),
        endDate: trialEndDate,
      },
      notifications: {
        email: true,
        telegram: false,
        push: false,
      },
      preferences: {
        theme: "light",
        currency: "USD",
        timezone: "UTC",
      },
    }

    return this.createUserSettings(userSettings)
  }

  // Bot operations
  async createBot(botData: Omit<Bot, "_id">): Promise<Bot> {
    const bots = await this.getCollection<Bot>("bots")
    const result = await bots.insertOne({
      ...botData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const bot = await bots.findOne({ _id: result.insertedId })
    if (!bot) throw new Error("Failed to create bot")
    return bot
  }

  async getBotById(botId: string): Promise<Bot | null> {
    const bots = await this.getCollection<Bot>("bots")
    return bots.findOne({ _id: new ObjectId(botId) })
  }

  async getUserBots(userId: string): Promise<Bot[]> {
    const bots = await this.getCollection<Bot>("bots")
    return bots.find({ userId }).toArray()
  }

  async updateBot(botId: string, updates: Partial<Bot>): Promise<void> {
    const bots = await this.getCollection<Bot>("bots")
    await bots.updateOne({ _id: new ObjectId(botId) }, { $set: { ...updates, updatedAt: new Date() } })
  }

  async deleteBot(botId: string): Promise<void> {
    const bots = await this.getCollection<Bot>("bots")
    await bots.deleteOne({ _id: new ObjectId(botId) })
  }

  async getActiveBots(): Promise<Bot[]> {
    const bots = await this.getCollection<Bot>("bots")
    return bots.find({ status: "active" }).toArray()
  }

  // Trade operations
  async createTrade(tradeData: Omit<Trade, "_id">): Promise<Trade> {
    const trades = await this.getCollection<Trade>("trades")
    const result = await trades.insertOne({
      ...tradeData,
      timestamp: new Date(),
    })

    const trade = await trades.findOne({ _id: result.insertedId })
    if (!trade) throw new Error("Failed to create trade")
    return trade
  }

  async getUserTrades(userId: string, limit = 100): Promise<Trade[]> {
    const trades = await this.getCollection<Trade>("trades")
    return trades.find({ userId }).sort({ timestamp: -1 }).limit(limit).toArray()
  }

  async getBotTrades(botId: string, limit = 100): Promise<Trade[]> {
    const trades = await this.getCollection<Trade>("trades")
    return trades.find({ botId }).sort({ timestamp: -1 }).limit(limit).toArray()
  }

  async updateTrade(tradeId: string, updates: Partial<Trade>): Promise<void> {
    const trades = await this.getCollection<Trade>("trades")
    await trades.updateOne({ _id: new ObjectId(tradeId) }, { $set: updates })
  }

  // API Key operations
  async createAPIKey(
    userId: string,
    keyData: {
      name: string
      key: string
      permissions: string[]
    },
  ): Promise<void> {
    const settings = await this.getCollection<UserSettings>("userSettings")
    await settings.updateOne(
      { userId },
      {
        $push: {
          apiKeys: {
            id: new ObjectId().toString(),
            ...keyData,
            createdAt: new Date(),
            isActive: true,
          },
        },
      },
      { upsert: true },
    )
  }

  async getUserAPIKeys(userId: string): Promise<UserSettings["apiKeys"]> {
    const settings = await this.getUserSettings(userId)
    return settings?.apiKeys || []
  }

  async updateAPIKey(userId: string, keyId: string, updates: any): Promise<void> {
    const settings = await this.getCollection<UserSettings>("userSettings")
    await settings.updateOne({ userId, "apiKeys.id": keyId }, { $set: { "apiKeys.$": { ...updates } } })
  }

  async deleteAPIKey(userId: string, keyId: string): Promise<void> {
    const settings = await this.getCollection<UserSettings>("userSettings")
    await settings.updateOne({ userId }, { $pull: { apiKeys: { id: keyId } } })
  }

  // Analytics operations
  async getUserStats(userId: string): Promise<{
    totalBots: number
    activeBots: number
    totalTrades: number
    totalPnL: number
    winRate: number
  }> {
    const bots = await this.getUserBots(userId)
    const trades = await this.getUserTrades(userId)

    const totalBots = bots.length
    const activeBots = bots.filter((bot) => bot.status === "active").length
    const totalTrades = trades.length
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
    const winningTrades = trades.filter((trade) => (trade.pnl || 0) > 0).length
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

    return {
      totalBots,
      activeBots,
      totalTrades,
      totalPnL,
      winRate,
    }
  }

  // Portfolio operations
  async getUserPortfolio(userId: string): Promise<{
    totalValue: number
    positions: Array<{
      symbol: string
      amount: number
      value: number
      pnl: number
    }>
  }> {
    // Mock portfolio data - in real implementation, calculate from trades
    return {
      totalValue: 10000,
      positions: [
        { symbol: "BTC/USDT", amount: 0.5, value: 25000, pnl: 1250 },
        { symbol: "ETH/USDT", amount: 10, value: 20000, pnl: -500 },
      ],
    }
  }
}

export const database = new Database()
