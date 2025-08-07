import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI is not set")
}

// Cache the client across hot reloads in dev and across invocations when possible.
declare global {
  // eslint-disable-next-line no-var
  var __mongoClient: MongoClient | undefined
}

let client: MongoClient

export async function getMongoClient() {
  if (!global.__mongoClient) {
    global.__mongoClient = new MongoClient(uri)
    await global.__mongoClient.connect()
  }
  return global.__mongoClient
}

export async function getDb() {
  const client = await getMongoClient()
  // Use the DB specified in the URI
  return client.db()
}
