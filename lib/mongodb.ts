import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const DB_NAME = process.env.DB_NAME || "coinwayfinder"

// Use supported options only
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  // family: 4 // uncomment if you need to force IPv4 on certain hosts
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === "development") {
  // Reuse connection in dev to avoid creating multiple clients during HMR
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export interface DatabaseConnection {
  client: MongoClient
  db: Db
}

/**
 * Connect to MongoDB and return a client and db handle.
 * Keep all calls inside functions/handlers to avoid connecting during module load.
 */
export async function connectToDatabase(): Promise<DatabaseConnection> {
  const client = await clientPromise
  const db = client.db(DB_NAME)
  return { client, db }
}

/**
 * Optional health check helper. Doesn't auto-run during import.
 */
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

/**
 * Optional one-time initializer: create useful indexes.
 */
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

// Keep default export for modules that import the promise directly
export default clientPromise
