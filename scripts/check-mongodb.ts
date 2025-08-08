import { MongoClient } from "mongodb"

async function main() {
  const uri = process.env.MONGODB_URI
  const dbName = process.env.DB_NAME || "coinwayfinder"

  if (!uri) {
    console.error('MONGODB_URI is not set. Please set it before running this script.')
    process.exitCode = 1
    return
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })

  const start = Date.now()
  try {
    await client.connect()
    await client.db("admin").command({ ping: 1 })
    const elapsed = Date.now() - start
    console.log('MongoDB connection successful.')
    console.log(`Database: ${dbName}`)
    console.log(`Ping latency: ${elapsed} ms`)
    process.exitCode = 0
  } catch (err: any) {
    console.error('MongoDB connection failed.')
    console.error(err?.message || err)
    process.exitCode = 2
  } finally {
    try {
      await client.close()
    } catch {
      // ignore
    }
  }
}

main().catch((e) => {
  console.error('Unexpected error:', e)
  process.exitCode = 3
})
