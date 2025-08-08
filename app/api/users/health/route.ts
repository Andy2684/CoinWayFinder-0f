export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Perform a minimal, safe check that doesn't throw if DB is down.
    const { MongoClient } = await import("mongodb")
    const uri = process.env.MONGODB_URI
    if (!uri) {
      return NextResponse.json({ status: "error", message: "MONGODB_URI is not set" }, { status: 503 })
    }

    const client = new MongoClient(uri, {
      maxPoolSize: 3,
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 10000,
      ...(process.env.MONGODB_FORCE_IPV4 === "1" ? ({ family: 4 } as const) : {}),
    })

    try {
      await client.connect()
      const dbName = process.env.DB_NAME || client.db().databaseName
      const db = client.db(dbName)
      // Use an existing collection if available; avoid assuming schema
      const collections = await db.collections()
      const userCollection =
        collections.find((c) => c.collectionName === "users") || db.collection("users")
      // countDocuments can fail if collection doesn't exist on some providers; wrap safely
      let userCount = 0
      try {
        userCount = await userCollection.countDocuments({})
      } catch {
        userCount = 0
      }

      return NextResponse.json(
        { status: "ok", database: dbName, users: userCount },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      )
    } finally {
      await client.close().catch(() => {})
    }
  } catch (e: any) {
    return NextResponse.json(
      { status: "error", message: e?.message || "Database health check failed" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
