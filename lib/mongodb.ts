import { MongoClient, type Db } from "mongodb"

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const DB_NAME = process.env.DB_NAME || "coinwayfinder"

// Only supported options; avoid deprecated ones that caused previous errors.
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

async function getMongoClient(): Promise<MongoClient> {
  if (client) return client
  if (!clientPromise) {
    const c = new MongoClient(uri, options)
    clientPromise = c.connect().then((connected) => {
      client = connected
      return connected
    })
  }
  return clientPromise
}

export interface DatabaseConnection {
  client: MongoClient
  db: Db
}

/**
 * Lazily create and reuse a single MongoDB connection.
 * Importing this module will NOT connect to MongoDB at build time.
 * We only connect when this function is actually called at runtime.
 */
export async function connectToDatabase(): Promise<DatabaseConnection> {
  const c = await getMongoClient()
  const db = c.db(DB_NAME)
  return { client: c, db }
}

export async function checkDatabaseHealth(): Promise<{ status: "healthy" | "unhealthy"; message: string }> {
  try {
    const { client } = await connectToDatabase()
    await client.db("admin").command({ ping: 1 })
    return { status: "healthy", message: "Database connection is working" }
  } catch (error) {
    console.error("Database health check failed:", error)
    return { status: "unhealthy", message: "Database connection failed" }
  }
}

export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    const { db } = await connectToDatabase()
    await db.collection("users").createIndex({ email: 1 }, { unique: true, name: "uniq_email" })
    await db.collection("users").createIndex({ created_at: 1 }, { name: "created_at" })
    return { success: true, message: "Database initialized successfully" }
  } catch (error) {
    console.error("Database initialization failed:", error)
    return { success: false, message: "Failed to initialize database" }
  }
}
