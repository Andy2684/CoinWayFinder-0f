import { MongoClient, type Db, type Collection } from "mongodb"

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined
}

const uri = process.env.MONGODB_URI
if (!uri) {
  // Keep message clear; avoids leaking secrets
  throw new Error("MONGODB_URI env var is required")
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  if (!global.__mongoClientPromise) {
    client = new MongoClient(uri)
    global.__mongoClientPromise = client.connect()
  }
  clientPromise = global.__mongoClientPromise
} else {
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise
}

export async function getDb(dbName?: string): Promise<Db> {
  const c = await getMongoClient()
  return c.db(dbName)
}

export async function getCollection<T = any>(name: string, dbName?: string): Promise<Collection<T>> {
  const db = await getDb(dbName)
  return db.collection<T>(name)
}

export async function checkDatabaseHealth(): Promise<{ ok: boolean; pingMs: number }> {
  const start = Date.now()
  const c = await getMongoClient()
  await c.db().command({ ping: 1 })
  return { ok: true, pingMs: Date.now() - start }
}

export async function initializeDatabase() {
  const db = await getDb()
  // Users collection indexes
  const users = db.collection("users")
  await users.createIndex({ email: 1 }, { unique: true, name: "uniq_email" })
  await users.createIndex({ createdAt: 1 }, { name: "created_at" })

  return { ok: true }
}
