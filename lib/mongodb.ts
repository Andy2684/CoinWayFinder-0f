import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local")
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "coinwayfinder")
    return { client, db }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw new Error("Unable to connect to database")
  }
}

export async function checkDatabaseHealth(): Promise<{ status: string; message: string }> {
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

    // Create indexes for better performance
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("users").createIndex({ username: 1 }, { unique: true })
    await db.collection("users").createIndex({ created_at: 1 })

    return { success: true, message: "Database initialized successfully" }
  } catch (error) {
    console.error("Database initialization failed:", error)
    return { success: false, message: "Failed to initialize database" }
  }
}

export default clientPromise
