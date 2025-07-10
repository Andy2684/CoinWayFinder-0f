import { MongoClient, type Db, type Collection } from "mongodb"

const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.DB_NAME || "coinwayfinder"

let client: MongoClient | null = null
let db: Db | null = null

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db
  }

  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      await client.connect()
    }

    db = client.db(DB_NAME)
    console.log("Connected to MongoDB successfully")
    return db
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}

export class Database {
  private db: Db | null = null

  async connect(): Promise<void> {
    this.db = await connectToDatabase()
  }

  async getCollection(name: string): Promise<Collection> {
    if (!this.db) {
      await this.connect()
    }
    return this.db!.collection(name)
  }

  // User operations
  async createUser(userData: {
    email: string
    username: string
    password: string
    referralCode?: string
  }): Promise<any> {
    const users = await this.getCollection("users")
    const userId = new Date().getTime().toString()

    const user = {
      _id: userId,
      email: userData.email,
      username: userData.username,
      password: userData.password,
      role: "user",
      isActive: true,
      subscription: {
        plan: "free",
        status: "active",
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
      },
      referralCode: userData.referralCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await users.insertOne(user)
    return user
  }

  async createUserWithTrial(userId: string, referralCode?: string): Promise<any> {
    const users = await this.getCollection("users")

    const user = {
      _id: userId,
      email: `user${userId}@example.com`,
      username: `user${userId}`,
      role: "user",
      isActive: true,
      subscription: {
        plan: "trial",
        status: "active",
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
        createdAt: new Date(),
      },
      referralCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await users.insertOne(user)
    return user
  }

  async findUserById(userId: string): Promise<any> {
    const users = await this.getCollection("users")
    return users.findOne({ _id: userId })
  }

  async findUserByEmail(email: string): Promise<any> {
    const users = await this.getCollection("users")
    return users.findOne({ email })
  }

  async updateUser(userId: string, updates: any): Promise<any> {
    const users = await this.getCollection("users")
    await users.updateOne({ _id: userId }, { $set: { ...updates, updatedAt: new Date() } })
    return this.findUserById(userId)
  }

  // Bot operations
  async createBot(botData: any): Promise<any> {
    const bots = await this.getCollection("bots")
    const botId = `bot_${Date.now()}`

    const bot = {
      _id: botId,
      ...botData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await bots.insertOne(bot)
    return bot
  }

  async findBotsByUserId(userId: string): Promise<any[]> {
    const bots = await this.getCollection("bots")
    return bots.find({ userId }).toArray()
  }

  async updateBot(botId: string, updates: any): Promise<any> {
    const bots = await this.getCollection("bots")
    await bots.updateOne({ _id: botId }, { $set: { ...updates, updatedAt: new Date() } })
    return bots.findOne({ _id: botId })
  }

  // Trade operations
  async createTrade(tradeData: any): Promise<any> {
    const trades = await this.getCollection("trades")
    const tradeId = `trade_${Date.now()}`

    const trade = {
      _id: tradeId,
      ...tradeData,
      timestamp: new Date(),
    }

    await trades.insertOne(trade)
    return trade
  }

  async findTradesByUserId(userId: string, limit = 50, offset = 0): Promise<any[]> {
    const trades = await this.getCollection("trades")
    return trades.find({ userId }).sort({ timestamp: -1 }).skip(offset).limit(limit).toArray()
  }

  // API Key operations
  async createApiKey(userId: string, keyData: any): Promise<any> {
    const apiKeys = await this.getCollection("apiKeys")
    const keyId = `ak_${Math.random().toString(36).substring(2, 18)}`

    const apiKey = {
      _id: keyId,
      userId,
      ...keyData,
      createdAt: new Date(),
      lastUsed: null,
      isActive: true,
    }

    await apiKeys.insertOne(apiKey)
    return apiKey
  }

  async findApiKeysByUserId(userId: string): Promise<any[]> {
    const apiKeys = await this.getCollection("apiKeys")
    return apiKeys.find({ userId, isActive: true }).toArray()
  }

  async updateApiKey(keyId: string, updates: any): Promise<any> {
    const apiKeys = await this.getCollection("apiKeys")
    await apiKeys.updateOne({ _id: keyId }, { $set: { ...updates, updatedAt: new Date() } })
    return apiKeys.findOne({ _id: keyId })
  }

  // Subscription operations
  async updateSubscription(userId: string, subscriptionData: any): Promise<any> {
    const users = await this.getCollection("users")
    await users.updateOne({ _id: userId }, { $set: { subscription: subscriptionData, updatedAt: new Date() } })
    return this.findUserById(userId)
  }

  // Admin operations
  async findAdminByUsername(username: string): Promise<any> {
    const admins = await this.getCollection("admins")
    return admins.findOne({ username })
  }

  async createAdmin(adminData: any): Promise<any> {
    const admins = await this.getCollection("admins")
    const adminId = `admin_${Date.now()}`

    const admin = {
      _id: adminId,
      ...adminData,
      createdAt: new Date(),
    }

    await admins.insertOne(admin)
    return admin
  }

  // Utility methods
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.db) {
        await this.connect()
      }
      await this.db!.admin().ping()
      return true
    } catch (error) {
      console.error("Database health check failed:", error)
      return false
    }
  }

  async close(): Promise<void> {
    if (client) {
      await client.close()
      client = null
      db = null
      this.db = null
    }
  }
}

// Create and export the database instance
export const database = new Database()

// Export the connection function for backward compatibility
