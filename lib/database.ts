import { MongoClient, type Db, type Collection } from "mongodb"

const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || "mongodb://localhost:27017/coinwayfinder"
const MONGODB_DB = process.env.DB_NAME || "coinwayfinder"

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

interface GlobalMongo {
  conn: MongoClient | null
  promise: Promise<MongoClient> | null
}

declare global {
  var __mongo: GlobalMongo | undefined
}

let cached = global.__mongo

if (!cached) {
  cached = global.__mongo = { conn: null, promise: null }
}

export async function connectToDatabase(): Promise<Db> {
  if (cached!.conn) {
    return cached!.conn.db(MONGODB_DB)
  }

  if (!cached!.promise) {
    const opts = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    }

    cached!.promise = MongoClient.connect(MONGODB_URI, opts)
  }

  try {
    cached!.conn = await cached!.promise
    return cached!.conn.db(MONGODB_DB)
  } catch (e) {
    cached!.promise = null
    throw e
  }
}

export class Database {
  private db: Db | null = null

  async connect(): Promise<Db> {
    if (!this.db) {
      this.db = await connectToDatabase()
    }
    return this.db
  }

  async getCollection(name: string): Promise<Collection> {
    const db = await this.connect()
    return db.collection(name)
  }

  async disconnect(): Promise<void> {
    if (cached?.conn) {
      await cached.conn.close()
      cached.conn = null
      cached.promise = null
    }
  }

  // User operations
  async createUser(userData: any): Promise<any> {
    const users = await this.getCollection("users")
    const result = await users.insertOne({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    })
    return result
  }

  async findUser(query: any): Promise<any> {
    const users = await this.getCollection("users")
    return await users.findOne(query)
  }

  async updateUser(userId: string, updates: any): Promise<any> {
    const users = await this.getCollection("users")
    return await users.updateOne({ _id: userId }, { $set: { ...updates, updatedAt: new Date() } })
  }

  // Bot operations
  async createBot(botData: any): Promise<any> {
    const bots = await this.getCollection("bots")
    const result = await bots.insertOne({
      ...botData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "inactive",
    })
    return result
  }

  async findBot(query: any): Promise<any> {
    const bots = await this.getCollection("bots")
    return await bots.findOne(query)
  }

  async findBots(query: any): Promise<any[]> {
    const bots = await this.getCollection("bots")
    return await bots.find(query).toArray()
  }

  async updateBot(botId: string, updates: any): Promise<any> {
    const bots = await this.getCollection("bots")
    return await bots.updateOne({ _id: botId }, { $set: { ...updates, updatedAt: new Date() } })
  }

  async deleteBot(botId: string): Promise<any> {
    const bots = await this.getCollection("bots")
    return await bots.deleteOne({ _id: botId })
  }

  // Trade operations
  async createTrade(tradeData: any): Promise<any> {
    const trades = await this.getCollection("trades")
    const result = await trades.insertOne({
      ...tradeData,
      timestamp: new Date(),
      createdAt: new Date(),
    })
    return result
  }

  async findTrades(query: any, options: any = {}): Promise<any[]> {
    const trades = await this.getCollection("trades")
    let cursor = trades.find(query)

    if (options.sort) {
      cursor = cursor.sort(options.sort)
    }
    if (options.limit) {
      cursor = cursor.limit(options.limit)
    }
    if (options.skip) {
      cursor = cursor.skip(options.skip)
    }

    return await cursor.toArray()
  }

  // API Key operations
  async createApiKey(keyData: any): Promise<any> {
    const apiKeys = await this.getCollection("apiKeys")
    const result = await apiKeys.insertOne({
      ...keyData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    })
    return result
  }

  async findApiKey(query: any): Promise<any> {
    const apiKeys = await this.getCollection("apiKeys")
    return await apiKeys.findOne(query)
  }

  async findApiKeys(query: any): Promise<any[]> {
    const apiKeys = await this.getCollection("apiKeys")
    return await apiKeys.find(query).toArray()
  }

  async updateApiKey(keyId: string, updates: any): Promise<any> {
    const apiKeys = await this.getCollection("apiKeys")
    return await apiKeys.updateOne({ _id: keyId }, { $set: { ...updates, updatedAt: new Date() } })
  }

  async deleteApiKey(keyId: string): Promise<any> {
    const apiKeys = await this.getCollection("apiKeys")
    return await apiKeys.deleteOne({ _id: keyId })
  }

  // Subscription operations
  async updateSubscription(userId: string, subscriptionData: any): Promise<any> {
    const users = await this.getCollection("users")
    return await users.updateOne(
      { _id: userId },
      {
        $set: {
          subscription: subscriptionData,
          updatedAt: new Date(),
        },
      },
    )
  }

  // System logs
  async createLog(logData: any): Promise<any> {
    const logs = await this.getCollection("systemLogs")
    const result = await logs.insertOne({
      ...logData,
      timestamp: new Date(),
    })
    return result
  }

  async findLogs(query: any, options: any = {}): Promise<any[]> {
    const logs = await this.getCollection("systemLogs")
    let cursor = logs.find(query)

    if (options.sort) {
      cursor = cursor.sort(options.sort)
    }
    if (options.limit) {
      cursor = cursor.limit(options.limit)
    }
    if (options.skip) {
      cursor = cursor.skip(options.skip)
    }

    return await cursor.toArray()
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const db = await this.connect()
      await db.admin().ping()
      return true
    } catch (error) {
      console.error("Database health check failed:", error)
      return false
    }
  }
}

// Create and export the database instance
export const database = new Database()

// Export the connection function for backward compatibility
export { connectToDatabase as default }
