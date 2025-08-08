// Node.js script to verify MONGODB_URI locally.
// Run: pnpm tsx scripts/check-mongodb.ts  (or) node --loader ts-node/esm scripts/check-mongodb.ts

import { MongoClient } from "mongodb"

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is not set. Please export it or set it in your environment.')
    process.exit(1)
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })

  const startedAt = Date.now()
  try {
    await client.connect()
    await client.db("admin").command({ ping: 1 })
    const ms = Date.now() - startedAt
    console.log(`Success: Connected to MongoDB in ${ms}ms`)
    console.log(`Default DB: ${client.db().databaseName}`)
    process.exit(0)
  } catch (err: any) {
    console.error("Connection failed.")
    console.error(err?.message || err)
    console.error(
      [
        "",
        "Troubleshooting:",
        "- Ensure your username/password are correct and URL-encoded.",
        "- If using MongoDB Atlas (SRV URI), verify DNS works from your environment.",
        "- Allow this machine/IP in Network Access (Atlas) or VPC firewall.",
        "- Try increasing serverSelectionTimeoutMS if your cluster is slow to respond.",
      ].join("\n")
    )
    process.exit(2)
  } finally {
    await client.close().catch(() => {})
  }
}

main()
