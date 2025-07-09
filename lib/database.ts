import { MongoClient, type Db, ObjectId } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const MONGODB_DB = process.env.MONGODB_DB || "coinwayfinder"

let client: MongoClient
let db: Db

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (!client) {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    db = client.db(MONGODB_DB)
  }
  return { client, db }
}

export interface User {
  _id?: ObjectId
  email: string
  password: string
  name: string
  isVerified: boolean
  createdAt: Date
  lastLoginAt?: Date
}

export interface UserSettings {
  _id?: ObjectId
  userId: string
  subscription: {
    plan: string
    status: string
    endDate: Date
    stripeCustomerId?: string
    stripeSubscriptionId?: string
  }
  trial: {
    isActive: boolean
    startDate: Date
    endDate: Date
    hasUsed: boolean
  }
  apiKeys: Array<{
    id: string
    name: string
    exchange: string
    apiKey: string
    secretKey: string
    passphrase?: string
    isActive: boolean
    createdAt: Date
  }>
  preferences: {
    notifications: boolean
    telegramChatId?: string
    riskLevel: "low" | "medium" | "high"
  }
  usage: {
    apiCalls: number
    lastReset: Date
    botsCreated: number
    tradesExecuted: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface Bot {
  _id?: ObjectId
  userId: string
  name: string
  strategy: string
  config: any
  status: "active" | "paused" | "stopped"
  performance: {
    totalTrades: number
    winRate: number
    totalPnL: number
    lastTradeAt?: Date
  }
  createdAt: Date
  updatedAt: Date
}

export interface Trade {
  _id?: ObjectId
  userId: string
  botId: string
  symbol: string
  side: "buy" | "sell"
  amount: number
  price: number
  fee: number
  pnl: number
  status: "pending" | "filled" | "cancelled"
  exchange: string
  orderId: string
  createdAt: Date
  filledAt?: Date
}

class Database {
  private db: Db | null = null

  private async getDb(): Promise<Db> {
    if (!this.db) {
      const { db } = await connectToDatabase()
      this.db = db
    }
    return this.db
  }

  // User methods
  async createUser(userData: Omit<User, "_id" | "createdAt">): Promise<string> {
    const db = await this.getDb()
    const user: User = {
      ...userData,
      createdAt: new Date(),
    }
    const result = await db.collection("users").insertOne(user)
    return result.insertedId.toString()
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = await this.getDb()
    return await db.collection("users").findOne({ email })
  }

  async getUserById(id: string): Promise<User | null> {
    const db = await this.getDb()
    return await db.collection("users").findOne({ _id: new ObjectId(id) })
  }

  async updateUser(id: string, updates: Partial<User>): Promise<boolean> {
    const db = await this.getDb()
    const result = await db.collection("users").updateOne({ _id: new ObjectId(id) }, { $set: updates })
    return result.modifiedCount > 0
  }

  // User Settings methods
  async createUserWithTrial(userId: string): Promise<UserSettings> {
    const db = await this.getDb()
    const now = new Date()
    const trialEndDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days

    const userSettings: UserSettings = {
      userId,
      subscription: {
        plan: "trial",
        status: "active",
        endDate: trialEndDate,
      },
      trial: {
        isActive: true,
        startDate: now,
        endDate: trialEndDate,
        hasUsed: true,
      },
      apiKeys: [],
      preferences: {
        notifications: true,
        riskLevel: "medium",
      },
      usage: {
        apiCalls: 0,
        lastReset: now,
        botsCreated: 0,
        tradesExecuted: 0,
      },
      createdAt: now,
      updatedAt: now,
    }

    await db.collection("userSettings").insertOne(userSettings)
    return userSettings
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const db = await this.getDb()
    return await db.collection("userSettings").findOne({ userId })
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<boolean> {
    const db = await this.getDb()
    const result = await db
      .collection("userSettings")
      .updateOne({ userId }, { $set: { ...updates, updatedAt: new Date() } })
    return result.modifiedCount > 0
  }

  async updateSubscription(userId: string, subscription: UserSettings["subscription"]): Promise<boolean> {
    const db = await this.getDb()
    const result = await db.collection("userSettings").updateOne(
      { userId },
      {
        $set: {
          subscription,
          updatedAt: new Date(),
        },
      },
    )
    return result.modifiedCount > 0
  }

  async startTrial(userId: string): Promise<boolean> {
    const db = await this.getDb()
    const now = new Date()
    const trialEndDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days

    const result = await db.collection("userSettings").updateOne(
      { userId },
      {
        $set: {
          "trial.isActive": true,
          "trial.startDate": now,
          "trial.endDate": trialEndDate,
          "trial.hasUsed": true,
          "subscription.plan": "trial",
          "subscription.status": "active",
          "subscription.endDate": trialEndDate,
          updatedAt: now,
        },
      },
    )
    return result.modifiedCount > 0
  }

  async endTrial(userId: string): Promise<boolean> {
    const db = await this.getDb()
    const result = await db.collection("userSettings").updateOne(
      { userId },
      {
        $set: {
          "trial.isActive": false,
          "subscription.plan": "free",
          "subscription.status": "inactive",
          updatedAt: new Date(),
        },
      },
    )
    return result.modifiedCount > 0
  }

  // Bot methods
  async createBot(botData: Omit<Bot, "_id" | "createdAt" | "updatedAt">): Promise<string> {
    const db = await this.getDb()
    const bot: Bot = {
      ...botData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await db.collection("bots").insertOne(bot)
    return result.insertedId.toString()
  }

  async getUserBots(userId: string): Promise<Bot[]> {
    const db = await this.getDb()
    return await db.collection("bots").find({ userId }).toArray()
  }

  async getBotById(id: string): Promise<Bot | null> {
    const db = await this.getDb()
    return await db.collection("bots").findOne({ _id: new ObjectId(id) })
  }

  async updateBot(id: string, updates: Partial<Bot>): Promise<boolean> {
    const db = await this.getDb()
    const result = await db
      .collection("bots")
      .updateOne({ _id: new ObjectId(id) }, { $set: { ...updates, updatedAt: new Date() } })
    return result.modifiedCount > 0
  }

  async deleteBot(id: string): Promise<boolean> {
    const db = await this.getDb()
    const result = await db.collection("bots").deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  // Trade methods
  async createTrade(tradeData: Omit<Trade, "_id" | "createdAt">): Promise<string> {
    const db = await this.getDb()
    const trade: Trade = {
      ...tradeData,
      createdAt: new Date(),
    }
    const result = await db.collection("trades").insertOne(trade)
    return result.insertedId.toString()
  }

  async getUserTrades(userId: string, limit = 50): Promise<Trade[]> {
    const db = await this.getDb()
    return await db.collection("trades").find({ userId }).sort({ createdAt: -1 }).limit(limit).toArray()
  }

  async getBotTrades(botId: string, limit = 50): Promise<Trade[]> {
    const db = await this.getDb()
    return await db.collection("trades").find({ botId }).sort({ createdAt: -1 }).limit(limit).toArray()
  }

  async updateTrade(id: string, updates: Partial<Trade>): Promise<boolean> {
    const db = await this.getDb()
    const result = await db.collection("trades").updateOne({ _id: new ObjectId(id) }, { $set: updates })
    return result.modifiedCount > 0
  }

  // Analytics methods
  async getUserStats(userId: string): Promise<any> {
    const db = await this.getDb()
    const [bots, trades, settings] = await Promise.all([
      db.collection("bots").countDocuments({ userId }),
      db.collection("trades").countDocuments({ userId }),
      this.getUserSettings(userId),
    ])

    const totalPnL = await db
      .collection("trades")
      .aggregate([{ $match: { userId } }, { $group: { _id: null, total: { $sum: "$pnl" } } }])
      .toArray()

    return {
      totalBots: bots,
      totalTrades: trades,
      totalPnL: totalPnL[0]?.total || 0,
      subscription: settings?.subscription,
      trial: settings?.trial,
    }
  }

  // Admin methods
  async getAllUsers(limit = 100): Promise<User[]> {
    const db = await this.getDb()
    return await db.collection("users").find({}).sort({ createdAt: -1 }).limit(limit).toArray()
  }

  async getUserCount(): Promise<number> {
    const db = await this.getDb()
    return await db.collection("users").countDocuments()
  }

  async getActiveSubscriptions(): Promise<number> {
    const db = await this.getDb()
    return await db.collection("userSettings").countDocuments({
      "subscription.status": "active",
      "subscription.plan": { $ne: "free" },
    })
  }
}

export const database = new Database()
