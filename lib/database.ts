import { MongoClient, type Db, type Collection } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.DB_NAME || "coinwayfinder"

interface User {
  _id?: string
  id: string
  email: string
  name: string
  password: string
  createdAt: Date
  lastLoginAt?: Date
  isActive: boolean
  emailVerified: boolean
  referralCode?: string
  referredBy?: string
}

interface UserSettings {
  userId: string
  subscription: {
    plan: "free" | "basic" | "premium" | "enterprise"
    status: "active" | "expired" | "cancelled" | "trialing"
    startDate?: Date
    endDate?: Date
    stripeCustomerId?: string
    stripeSubscriptionId?: string
  }
  trial: {
    hasUsed: boolean
    startDate?: Date
    endDate?: Date
    isActive: boolean
  }
  notifications: {
    email: boolean
    telegram: boolean
    push: boolean
  }
  preferences: {
    theme: "light" | "dark"
    currency: string
    timezone: string
  }
}

interface Bot {
  _id?: string
  id: string
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
    roi: number
  }
  createdAt: Date
  updatedAt: Date
}

interface Trade {
  _id?: string
  id: string
  botId: string
  userId: string
  symbol: string
  side: "buy" | "sell"
  amount: number
  price: number
  fee: number
  pnl?: number
  status: "pending" | "filled" | "cancelled"
  timestamp: Date
  exchange: string
}

class Database {
  private client: MongoClient | null = null
  private db: Db | null = null

  async connect(): Promise<void> {
    if (this.client && this.db) {
      return
    }

    try {
      this.client = new MongoClient(MONGODB_URI)
      await this.client.connect()
      this.db = this.client.db(DB_NAME)
      console.log("Connected to MongoDB")
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error)
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

  // User methods
  async createUser(user: Omit<User, "_id">): Promise<User> {
    const collection = await this.getCollection<User>("users")
    const result = await collection.insertOne(user as User)
    return { ...user, _id: result.insertedId.toString() }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection<User>("users")
    return await collection.findOne({ email })
  }

  async getUserById(id: string): Promise<User | null> {
    const collection = await this.getCollection<User>("users")
    return await collection.findOne({ id })
  }

  async updateUser(id: string, updates: Partial<User>): Promise<boolean> {
    const collection = await this.getCollection<User>("users")
    const result = await collection.updateOne({ id }, { $set: updates })
    return result.modifiedCount > 0
  }

  async getAllUsers(limit = 100): Promise<User[]> {
    const collection = await this.getCollection<User>("users")
    return await collection.find({}).limit(limit).toArray()
  }

  async getUserCount(): Promise<number> {
    const collection = await this.getCollection<User>("users")
    return await collection.countDocuments()
  }

  // User Settings methods
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const collection = await this.getCollection<UserSettings>("user_settings")
    return await collection.findOne({ userId })
  }

  async createUserSettings(settings: UserSettings): Promise<UserSettings> {
    const collection = await this.getCollection<UserSettings>("user_settings")
    await collection.insertOne(settings)
    return settings
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<boolean> {
    const collection = await this.getCollection<UserSettings>("user_settings")
    const result = await collection.updateOne({ userId }, { $set: updates }, { upsert: true })
    return result.modifiedCount > 0 || result.upsertedCount > 0
  }

  async updateSubscription(userId: string, subscription: UserSettings["subscription"]): Promise<boolean> {
    const collection = await this.getCollection<UserSettings>("user_settings")
    const result = await collection.updateOne({ userId }, { $set: { subscription } }, { upsert: true })
    return result.modifiedCount > 0 || result.upsertedCount > 0
  }

  async getActiveSubscriptions(): Promise<number> {
    const collection = await this.getCollection<UserSettings>("user_settings")
    return await collection.countDocuments({ "subscription.status": "active" })
  }

  // Trial methods
  async startTrial(userId: string): Promise<boolean> {
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days

    const collection = await this.getCollection<UserSettings>("user_settings")
    const result = await collection.updateOne(
      { userId },
      {
        $set: {
          trial: {
            hasUsed: true,
            startDate,
            endDate,
            isActive: true,
          },
          subscription: {
            plan: "premium",
            status: "trialing",
            startDate,
            endDate,
          },
        },
      },
      { upsert: true },
    )

    return result.modifiedCount > 0 || result.upsertedCount > 0
  }

  async getTrialStatus(userId: string): Promise<{
    hasUsed: boolean
    isActive: boolean
    daysRemaining: number
    endDate?: Date
  }> {
    const settings = await this.getUserSettings(userId)

    if (!settings?.trial) {
      return {
        hasUsed: false,
        isActive: false,
        daysRemaining: 3,
      }
    }

    const { trial } = settings
    const now = new Date()
    const daysRemaining = trial.endDate
      ? Math.max(0, Math.ceil((trial.endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
      : 0

    return {
      hasUsed: trial.hasUsed,
      isActive: trial.isActive && daysRemaining > 0,
      daysRemaining,
      endDate: trial.endDate,
    }
  }

  // Bot methods
  async createBot(bot: Omit<Bot, "_id">): Promise<Bot> {
    const collection = await this.getCollection<Bot>("bots")
    const result = await collection.insertOne(bot as Bot)
    return { ...bot, _id: result.insertedId.toString() }
  }

  async getUserBots(userId: string): Promise<Bot[]> {
    const collection = await this.getCollection<Bot>("bots")
    return await collection.find({ userId }).toArray()
  }

  async getBotById(id: string): Promise<Bot | null> {
    const collection = await this.getCollection<Bot>("bots")
    return await collection.findOne({ id })
  }

  async updateBot(id: string, updates: Partial<Bot>): Promise<boolean> {
    const collection = await this.getCollection<Bot>("bots")
    const result = await collection.updateOne({ id }, { $set: updates })
    return result.modifiedCount > 0
  }

  async deleteBot(id: string): Promise<boolean> {
    const collection = await this.getCollection<Bot>("bots")
    const result = await collection.deleteOne({ id })
    return result.deletedCount > 0
  }

  // Trade methods
  async createTrade(trade: Omit<Trade, "_id">): Promise<Trade> {
    const collection = await this.getCollection<Trade>("trades")
    const result = await collection.insertOne(trade as Trade)
    return { ...trade, _id: result.insertedId.toString() }
  }

  async getUserTrades(userId: string, limit = 100): Promise<Trade[]> {
    const collection = await this.getCollection<Trade>("trades")
    return await collection.find({ userId }).limit(limit).sort({ timestamp: -1 }).toArray()
  }

  async getBotTrades(botId: string, limit = 100): Promise<Trade[]> {
    const collection = await this.getCollection<Trade>("trades")
    return await collection.find({ botId }).limit(limit).sort({ timestamp: -1 }).toArray()
  }

  async updateTrade(id: string, updates: Partial<Trade>): Promise<boolean> {
    const collection = await this.getCollection<Trade>("trades")
    const result = await collection.updateOne({ id }, { $set: updates })
    return result.modifiedCount > 0
  }
}

export const database = new Database()

export async function connectToDatabase(): Promise<Database> {
  await database.connect()
  return database
}
