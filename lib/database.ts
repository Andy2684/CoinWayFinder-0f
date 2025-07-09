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
  isActive?: boolean
}

interface UserSettings {
  _id?: ObjectId
  userId: string
  subscription: {
    plan: string
    status: string
    startDate: Date
    endDate: Date
    trialUsed: boolean
  }
  referrals: {
    referralCode: string
    referredUsers: string[]
    bonusDays: number
  }
  usage: {
    bots: number
    apiCalls: number
    portfolios: number
    alerts: number
  }
  preferences: {
    notifications: boolean
    theme: string
    timezone: string
  }
}

interface Bot {
  _id?: ObjectId
  userId: string
  name: string
  exchange: string
  strategy: string
  symbol: string
  status: string
  config: {
    riskLevel: number
    lotSize: number
    takeProfit: number
    stopLoss: number
    investment: number
    dcaInterval?: string
    parameters?: any
  }
  stats: {
    totalTrades: number
    winRate: number
    totalProfit: number
    totalLoss: number
    currentDrawdown: number
  }
  createdAt: Date
  updatedAt: Date
  lastRunAt?: Date
}

interface APIKey {
  _id?: ObjectId
  userId: string
  name: string
  key: string
  permissions: string[]
  isActive: boolean
  createdAt: Date
  lastUsedAt?: Date
  expiresAt?: Date
  usageCount: number
  rateLimit: number
}

class Database {
  private client: MongoClient | null = null
  private db: Db | null = null

  async connect(): Promise<void> {
    if (this.client) {
      return
    }

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
    const result = await users.insertOne(userData)
    return { ...userData, _id: result.insertedId }
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getCollection<User>("users")
    return users.findOne({ _id: new ObjectId(id) })
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getCollection<User>("users")
    return users.findOne({ email })
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const users = await this.getCollection<User>("users")
    await users.updateOne({ _id: new ObjectId(id) }, { $set: updates })
  }

  // User settings operations
  async createUserWithTrial(userId: string): Promise<void> {
    const settings = await this.getCollection<UserSettings>("user_settings")

    const userSettings: Omit<UserSettings, "_id"> = {
      userId,
      subscription: {
        plan: "free",
        status: "trial",
        startDate: new Date(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days trial
        trialUsed: false,
      },
      referrals: {
        referralCode: `REF_${userId.slice(-8).toUpperCase()}`,
        referredUsers: [],
        bonusDays: 0,
      },
      usage: {
        bots: 0,
        apiCalls: 0,
        portfolios: 0,
        alerts: 0,
      },
      preferences: {
        notifications: true,
        theme: "dark",
        timezone: "UTC",
      },
    }

    await settings.insertOne(userSettings)
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const settings = await this.getCollection<UserSettings>("user_settings")
    return settings.findOne({ userId })
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<void> {
    const settings = await this.getCollection<UserSettings>("user_settings")
    await settings.updateOne({ userId }, { $set: updates })
  }

  // Bot operations
  async createBot(botData: Omit<Bot, "_id">): Promise<Bot> {
    const bots = await this.getCollection<Bot>("bots")
    const result = await bots.insertOne(botData)
    return { ...botData, _id: result.insertedId }
  }

  async getBotById(id: string): Promise<Bot | null> {
    const bots = await this.getCollection<Bot>("bots")
    return bots.findOne({ _id: new ObjectId(id) })
  }

  async getUserBots(userId: string): Promise<Bot[]> {
    const bots = await this.getCollection<Bot>("bots")
    return bots.find({ userId }).toArray()
  }

  async updateBot(id: string, updates: Partial<Bot>): Promise<void> {
    const bots = await this.getCollection<Bot>("bots")
    await bots.updateOne({ _id: new ObjectId(id) }, { $set: { ...updates, updatedAt: new Date() } })
  }

  async deleteBot(id: string): Promise<void> {
    const bots = await this.getCollection<Bot>("bots")
    await bots.deleteOne({ _id: new ObjectId(id) })
  }

  // API Key operations
  async createAPIKey(keyData: Omit<APIKey, "_id">): Promise<APIKey> {
    const apiKeys = await this.getCollection<APIKey>("api_keys")
    const result = await apiKeys.insertOne(keyData)
    return { ...keyData, _id: result.insertedId }
  }

  async getAPIKey(key: string): Promise<APIKey | null> {
    const apiKeys = await this.getCollection<APIKey>("api_keys")
    return apiKeys.findOne({ key })
  }

  async getUserAPIKeys(userId: string): Promise<APIKey[]> {
    const apiKeys = await this.getCollection<APIKey>("api_keys")
    return apiKeys.find({ userId }).toArray()
  }

  async updateAPIKey(id: string, updates: Partial<APIKey>): Promise<void> {
    const apiKeys = await this.getCollection<APIKey>("api_keys")
    await apiKeys.updateOne({ _id: new ObjectId(id) }, { $set: updates })
  }

  async deleteAPIKey(id: string): Promise<void> {
    const apiKeys = await this.getCollection<APIKey>("api_keys")
    await apiKeys.deleteOne({ _id: new ObjectId(id) })
  }

  async getAPIKeyUsage(keyId: string, since: Date): Promise<number> {
    // This would typically query a usage log table
    // For now, return a mock value
    return Math.floor(Math.random() * 100)
  }

  // Generic operations
  async findOne<T>(collection: string, query: any): Promise<T | null> {
    const col = await this.getCollection<T>(collection)
    return col.findOne(query)
  }

  async find<T>(collection: string, query: any): Promise<T[]> {
    const col = await this.getCollection<T>(collection)
    return col.find(query).toArray()
  }

  async insertOne<T>(collection: string, document: T): Promise<ObjectId> {
    const col = await this.getCollection<T>(collection)
    const result = await col.insertOne(document)
    return result.insertedId
  }

  async updateOne<T>(collection: string, query: any, update: any): Promise<void> {
    const col = await this.getCollection<T>(collection)
    await col.updateOne(query, update)
  }

  async deleteOne(collection: string, query: any): Promise<void> {
    const col = await this.getCollection(collection)
    await col.deleteOne(query)
  }
}

export const database = new Database()

// Auto-connect on import
database.connect().catch(console.error)

// Export types
export type { User, UserSettings, Bot, APIKey }
