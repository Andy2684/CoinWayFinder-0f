import { MongoClient, type Db, type Collection, ObjectId } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.DB_NAME || "coinwayfinder"

let client: MongoClient
let db: Db

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db
  }

  try {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    db = client.db(DB_NAME)
    console.log("Connected to MongoDB")
    return db
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}

export interface User {
  _id?: ObjectId
  email: string
  username: string
  password: string
  createdAt: Date
  lastLoginAt?: Date
  emailVerified?: boolean
  isActive?: boolean
}

export interface Bot {
  _id?: ObjectId
  userId: string
  name: string
  strategy: string
  status: "active" | "paused" | "stopped"
  config: any
  createdAt: Date
  updatedAt: Date
  performance?: {
    totalTrades: number
    winRate: number
    totalPnL: number
  }
}

export interface Trade {
  _id?: ObjectId
  userId: string
  botId: string
  symbol: string
  side: "buy" | "sell"
  amount: number
  price: number
  timestamp: Date
  status: "pending" | "completed" | "failed"
  pnl?: number
}

export interface UserSettings {
  _id?: ObjectId
  userId: string
  subscription: {
    plan: "free" | "starter" | "pro" | "enterprise"
    status: "active" | "cancelled" | "expired"
    trialEndsAt?: Date
    currentPeriodEnd?: Date
  }
  apiKeys: {
    exchange: string
    publicKey: string
    secretKey: string
    isActive: boolean
  }[]
  notifications: {
    email: boolean
    telegram: boolean
    webhooks: string[]
  }
  createdAt: Date
  updatedAt: Date
}

class Database {
  private db: Db | null = null

  async getDb(): Promise<Db> {
    if (!this.db) {
      this.db = await connectToDatabase()
    }
    return this.db
  }

  async getUsersCollection(): Promise<Collection<User>> {
    const db = await this.getDb()
    return db.collection<User>("users")
  }

  async getBotsCollection(): Promise<Collection<Bot>> {
    const db = await this.getDb()
    return db.collection<Bot>("bots")
  }

  async getTradesCollection(): Promise<Collection<Trade>> {
    const db = await this.getDb()
    return db.collection<Trade>("trades")
  }

  async getUserSettingsCollection(): Promise<Collection<UserSettings>> {
    const db = await this.getDb()
    return db.collection<UserSettings>("userSettings")
  }

  // User operations
  async createUser(userData: Omit<User, "_id">): Promise<User> {
    const users = await this.getUsersCollection()
    const result = await users.insertOne(userData)
    return { ...userData, _id: result.insertedId }
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsersCollection()
    return users.findOne({ _id: new ObjectId(id) })
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getUsersCollection()
    return users.findOne({ email })
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const users = await this.getUsersCollection()
    await users.updateOne({ _id: new ObjectId(id) }, { $set: updates })
  }

  async deleteUser(id: string): Promise<void> {
    const users = await this.getUsersCollection()
    await users.deleteOne({ _id: new ObjectId(id) })
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.getUsersCollection()
    return users.find({}).toArray()
  }

  // Bot operations
  async createBot(botData: Omit<Bot, "_id">): Promise<Bot> {
    const bots = await this.getBotsCollection()
    const result = await bots.insertOne(botData)
    return { ...botData, _id: result.insertedId }
  }

  async getBotById(id: string): Promise<Bot | null> {
    const bots = await this.getBotsCollection()
    return bots.findOne({ _id: new ObjectId(id) })
  }

  async getBotsByUserId(userId: string): Promise<Bot[]> {
    const bots = await this.getBotsCollection()
    return bots.find({ userId }).toArray()
  }

  async updateBot(id: string, updates: Partial<Bot>): Promise<void> {
    const bots = await this.getBotsCollection()
    await bots.updateOne({ _id: new ObjectId(id) }, { $set: { ...updates, updatedAt: new Date() } })
  }

  async deleteBot(id: string): Promise<void> {
    const bots = await this.getBotsCollection()
    await bots.deleteOne({ _id: new ObjectId(id) })
  }

  // Trade operations
  async createTrade(tradeData: Omit<Trade, "_id">): Promise<Trade> {
    const trades = await this.getTradesCollection()
    const result = await trades.insertOne(tradeData)
    return { ...tradeData, _id: result.insertedId }
  }

  async getTradesByUserId(userId: string): Promise<Trade[]> {
    const trades = await this.getTradesCollection()
    return trades.find({ userId }).sort({ timestamp: -1 }).toArray()
  }

  async getTradesByBotId(botId: string): Promise<Trade[]> {
    const trades = await this.getTradesCollection()
    return trades.find({ botId }).sort({ timestamp: -1 }).toArray()
  }

  async updateTrade(id: string, updates: Partial<Trade>): Promise<void> {
    const trades = await this.getTradesCollection()
    await trades.updateOne({ _id: new ObjectId(id) }, { $set: updates })
  }

  // User settings operations
  async createUserSettings(settingsData: Omit<UserSettings, "_id">): Promise<UserSettings> {
    const settings = await this.getUserSettingsCollection()
    const result = await settings.insertOne(settingsData)
    return { ...settingsData, _id: result.insertedId }
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const settings = await this.getUserSettingsCollection()
    return settings.findOne({ userId })
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<void> {
    const settings = await this.getUserSettingsCollection()
    await settings.updateOne({ userId }, { $set: { ...updates, updatedAt: new Date() } })
  }

  async createUserWithTrial(userId: string): Promise<void> {
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 7) // 7-day trial

    const userSettings: Omit<UserSettings, "_id"> = {
      userId,
      subscription: {
        plan: "free",
        status: "active",
        trialEndsAt,
      },
      apiKeys: [],
      notifications: {
        email: true,
        telegram: false,
        webhooks: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await this.createUserSettings(userSettings)
  }

  // Analytics and stats
  async getUserStats(userId: string): Promise<any> {
    const bots = await this.getBotsByUserId(userId)
    const trades = await this.getTradesByUserId(userId)

    const totalBots = bots.length
    const activeBots = bots.filter((bot) => bot.status === "active").length
    const totalTrades = trades.length
    const completedTrades = trades.filter((trade) => trade.status === "completed")
    const totalPnL = completedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)

    return {
      totalBots,
      activeBots,
      totalTrades,
      totalPnL,
      winRate:
        completedTrades.length > 0
          ? (completedTrades.filter((trade) => (trade.pnl || 0) > 0).length / completedTrades.length) * 100
          : 0,
    }
  }

  async getSystemStats(): Promise<any> {
    const users = await this.getUsersCollection()
    const bots = await this.getBotsCollection()
    const trades = await this.getTradesCollection()

    const totalUsers = await users.countDocuments()
    const totalBots = await bots.countDocuments()
    const totalTrades = await trades.countDocuments()
    const activeBots = await bots.countDocuments({ status: "active" })

    return {
      totalUsers,
      totalBots,
      activeBots,
      totalTrades,
    }
  }
}

export const database = new Database()
