/**
 * Quick local connectivity check for MongoDB.
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." DB_NAME="coinwayfinder" npx ts-node scripts/check-mongodb.ts
 */
import { MongoClient } from "mongodb"

async function main() {
  const uri = process.env.MONGODB_URI
  const dbName = process.env.DB_NAME || "coinwayfinder"

  if (!uri) {
    console.error('Missing MONGODB_URI. Provide it via env, e.g. MONGODB_URI="..."')
    process.exit(1)
  }

  const startedAt = Date.now()
  const client = new MongoClient(uri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })

  try {
    console.log("Connecting to MongoDB...")
    await client.connect()
    console.log("Connected. Pinging admin...")
    const ping = await client.db("admin").command({ ping: 1 })
    const durationMs = Date.now() - startedAt
    console.log("Ping response:", ping)
    console.log(`OK: Connected to "${dbName}" in ${durationMs} ms`)
    process.exit(0)
  } catch (err: any) {
    const durationMs = Date.now() - startedAt
    console.error("ERROR: Failed to connect:", err?.message || err)
    console.error(`Attempt duration: ${durationMs} ms`)
    process.exit(2)
  } finally {
    await client.close().catch(() => {})
  }
}

main()
