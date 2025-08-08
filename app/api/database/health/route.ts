export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

import { NextResponse } from "next/server"

// Prefer the lazy Mongo connector if present in your codebase.
// Fallback to a local inline connector to avoid build-time side effects.
async function pingMongo(): Promise<{
  ok: boolean
  message: string
  database?: string
  durationMs: number
}> {
  const start = Date.now()
  try {
    // Lazily import to avoid connecting during module load.
    // If you already created "@/lib/mongodb" with connectToDatabase, use that:
    // const { connectToDatabase } = await import("@/lib/mongodb")
    // const { client, db } = await connectToDatabase()
    // await client.db("admin").command({ ping: 1 })
    // return { ok: true, message: "MongoDB connection is healthy", database: db.databaseName, durationMs: Date.now() - start }

    // Generic local, lazy connector (avoids any connection at import time)
    const { MongoClient } = await import("mongodb")
    const uri = process.env.MONGODB_URI
    if (!uri) {
      return { ok: false, message: "MONGODB_URI is not set", durationMs: Date.now() - start }
    }

    const client = new MongoClient(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 4000,
      socketTimeoutMS: 12000,
      ...(process.env.MONGODB_FORCE_IPV4 === "1" ? ({ family: 4 } as const) : {}),
    })

    try {
      await client.connect()
      await client.db("admin").command({ ping: 1 })
      const dbName = (process.env.DB_NAME || client.db().databaseName) ?? "unknown"
      return { ok: true, message: "MongoDB connection is healthy", database: dbName, durationMs: Date.now() - start }
    } finally {
      await client.close().catch(() => {})
    }
  } catch (e: any) {
    const msg = e?.message || String(e)
    return { ok: false, message: msg, durationMs: Date.now() - start }
  }
}

export async function GET() {
  const result = await pingMongo()
  if (result.ok) {
    return NextResponse.json(
      {
        status: "ok",
        message: result.message,
        database: result.database,
        durationMs: result.durationMs,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    )
  }
  return NextResponse.json(
    {
      status: "error",
      message: result.message,
      durationMs: result.durationMs,
    },
    {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    }
  )
}
