import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  bufferCommands: false,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const client = await clientPromise
    const db = client.db("coinwayfinder")

    // Test the connection
    await db.admin().ping()
    console.log("Successfully connected to MongoDB")

    return { client, db }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw new Error("Database connection failed")
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  try {
    const client = await clientPromise
    await client.close()
    console.log("MongoDB connection closed")
  } catch (error) {
    console.error("Error closing MongoDB connection:", error)
  }
}

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    await db.admin().ping()
    return true
  } catch (error) {
    console.error("Database health check failed:", error)
    return false
  }
}

// Initialize database collections and indexes
export async function initializeDatabase(): Promise<void> {
  try {
    const { db } = await connectToDatabase()

    // Create indexes for better performance
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("users").createIndex({ username: 1 }, { unique: true, sparse: true })
    await db.collection("users").createIndex({ created_at: 1 })

    // Create other collection indexes
    await db.collection("trading_bots").createIndex({ created_by: 1 })
    await db.collection("trading_bots").createIndex({ status: 1 })
    await db.collection("trade_history").createIndex({ user_id: 1 })
    await db.collection("trade_history").createIndex({ bot_id: 1 })
    await db.collection("portfolios").createIndex({ user_id: 1 })
    await db.collection("news_articles").createIndex({ published_at: -1 })
    await db.collection("trading_signals").createIndex({ created_at: -1 })

    console.log("Database indexes created successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}

export default clientPromise
