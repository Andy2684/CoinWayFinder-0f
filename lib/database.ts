import { MongoClient, type Db, type Collection } from "mongodb"

interface DatabaseConnection {
  client: MongoClient | null
  db: Db | null
  isConnected: boolean
}

class DatabaseManager {
  private connection: DatabaseConnection = {
    client: null,
    db: null,
    isConnected: false,
  }

  private connectionString: string
  private databaseName: string

  constructor() {
    this.connectionString = process.env.MONGODB_URI || ""
    this.databaseName = process.env.DB_NAME || "coinwayfinder"

    if (!this.connectionString) {
      console.warn("⚠️ MongoDB connection string not found. Database features will be disabled.")
    }
  }

  async connect(): Promise<Db | null> {
    if (this.connection.isConnected && this.connection.db) {
      return this.connection.db
    }

    if (!this.connectionString) {
      console.error("❌ Cannot connect to database: MongoDB URI not configured")
      return null
    }

    try {
      console.log("🔌 Connecting to MongoDB...")

      this.connection.client = new MongoClient(this.connectionString, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })

      await this.connection.client.connect()
      this.connection.db = this.connection.client.db(this.databaseName)
      this.connection.isConnected = true

      console.log("✅ Connected to MongoDB successfully")

      // Test the connection
      await this.connection.db.admin().ping()
      console.log("✅ Database ping successful")

      return this.connection.db
    } catch (error) {
      console.error("❌ Failed to connect to MongoDB:", error)
      this.connection.isConnected = false
      return null
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection.client) {
      try {
        await this.connection.client.close()
        console.log("✅ Disconnected from MongoDB")
      } catch (error) {
        console.error("❌ Error disconnecting from MongoDB:", error)
      }
    }

    this.connection = {
      client: null,
      db: null,
      isConnected: false,
    }
  }

  async getDatabase(): Promise<Db | null> {
    if (!this.connection.isConnected) {
      return await this.connect()
    }
    return this.connection.db
  }

  async getCollection<T = any>(collectionName: string): Promise<Collection<T> | null> {
    const db = await this.getDatabase()
    if (!db) {
      return null
    }
    return db.collection<T>(collectionName)
  }

  async healthCheck(): Promise<{ status: string; message: string; details?: any }> {
    if (!this.connectionString) {
      return {
        status: "not_configured",
        message: "MongoDB connection string not configured",
      }
    }

    try {
      const db = await this.getDatabase()
      if (!db) {
        return {
          status: "error",
          message: "Failed to connect to database",
        }
      }

      // Test the connection with a ping
      await db.admin().ping()

      // Get database stats
      const stats = await db.stats()

      return {
        status: "healthy",
        message: "Database connection is healthy",
        details: {
          databaseName: this.databaseName,
          collections: stats.collections,
          dataSize: stats.dataSize,
          indexSize: stats.indexSize,
        },
      }
    } catch (error) {
      return {
        status: "error",
        message: "Database health check failed",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }
    }
  }

  async initializeCollections(): Promise<void> {
    const db = await this.getDatabase()
    if (!db) {
      console.error("❌ Cannot initialize collections: Database not connected")
      return
    }

    try {
      // Create collections if they don't exist
      const collections = ["users", "bots", "trades", "subscriptions", "api_keys", "sessions", "logs"]

      for (const collectionName of collections) {
        try {
          await db.createCollection(collectionName)
          console.log(`✅ Created collection: ${collectionName}`)
        } catch (error) {
          // Collection might already exist, which is fine
          if (error instanceof Error && !error.message.includes("already exists")) {
            console.warn(`⚠️ Warning creating collection ${collectionName}:`, error.message)
          }
        }
      }

      // Create indexes
      await this.createIndexes()

      console.log("✅ Database collections initialized successfully")
    } catch (error) {
      console.error("❌ Failed to initialize collections:", error)
    }
  }

  private async createIndexes(): Promise<void> {
    const db = await this.getDatabase()
    if (!db) return

    try {
      // Users collection indexes
      const usersCollection = db.collection("users")
      await usersCollection.createIndex({ email: 1 }, { unique: true })
      await usersCollection.createIndex({ username: 1 }, { unique: true })
      await usersCollection.createIndex({ createdAt: 1 })

      // Bots collection indexes
      const botsCollection = db.collection("bots")
      await botsCollection.createIndex({ userId: 1 })
      await botsCollection.createIndex({ status: 1 })
      await botsCollection.createIndex({ createdAt: 1 })

      // Trades collection indexes
      const tradesCollection = db.collection("trades")
      await tradesCollection.createIndex({ userId: 1 })
      await tradesCollection.createIndex({ botId: 1 })
      await tradesCollection.createIndex({ timestamp: 1 })
      await tradesCollection.createIndex({ symbol: 1 })

      // API keys collection indexes
      const apiKeysCollection = db.collection("api_keys")
      await apiKeysCollection.createIndex({ userId: 1 })
      await apiKeysCollection.createIndex({ keyHash: 1 }, { unique: true })
      await apiKeysCollection.createIndex({ createdAt: 1 })

      // Sessions collection indexes
      const sessionsCollection = db.collection("sessions")
      await sessionsCollection.createIndex({ userId: 1 })
      await sessionsCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

      console.log("✅ Database indexes created successfully")
    } catch (error) {
      console.error("❌ Failed to create indexes:", error)
    }
  }

  isConnected(): boolean {
    return this.connection.isConnected
  }

  getConnectionStatus(): DatabaseConnection {
    return { ...this.connection }
  }
}

// Create a singleton instance
const databaseManager = new DatabaseManager()

// Export the manager and convenience functions
export default databaseManager

export async function getDatabase(): Promise<Db | null> {
  return databaseManager.getDatabase()
}

export async function getCollection<T = any>(collectionName: string): Promise<Collection<T> | null> {
  return databaseManager.getCollection<T>(collectionName)
}

export async function connectToDatabase(): Promise<Db | null> {
  return databaseManager.connect()
}

export async function disconnectFromDatabase(): Promise<void> {
  return databaseManager.disconnect()
}

export async function initializeDatabase(): Promise<void> {
  await databaseManager.initializeCollections()
}

export async function getDatabaseHealth(): Promise<{ status: string; message: string; details?: any }> {
  return databaseManager.healthCheck()
}

// Types for common database operations
export interface User {
  _id?: string
  email: string
  username: string
  passwordHash: string
  isActive: boolean
  subscription: {
    plan: "free" | "starter" | "pro" | "enterprise"
    status: "active" | "inactive" | "cancelled"
    expiresAt?: Date
  }
  profile: {
    firstName?: string
    lastName?: string
    avatar?: string
  }
  settings: {
    notifications: boolean
    theme: "light" | "dark"
    timezone: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface Bot {
  _id?: string
  userId: string
  name: string
  strategy: string
  status: "active" | "paused" | "stopped"
  config: {
    symbol: string
    exchange: string
    amount: number
    stopLoss?: number
    takeProfit?: number
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
  }
  createdAt: Date
  updatedAt: Date
}

export interface Trade {
  _id?: string
  userId: string
  botId: string
  symbol: string
  side: "buy" | "sell"
  amount: number
  price: number
  fee: number
  profit?: number
  status: "pending" | "filled" | "cancelled" | "failed"
  exchange: string
  timestamp: Date
  metadata?: {
    [key: string]: any
  }
}

export interface ApiKey {
  _id?: string
  userId: string
  name: string
  keyHash: string
  permissions: string[]
  lastUsed?: Date
  isActive: boolean
  expiresAt?: Date
  createdAt: Date
}

export interface Session {
  _id?: string
  userId: string
  sessionToken: string
  expiresAt: Date
  createdAt: Date
  metadata?: {
    userAgent?: string
    ipAddress?: string
    [key: string]: any
  }
}

// Export the database manager instance as 'database' for compatibility
export const database = databaseManager
