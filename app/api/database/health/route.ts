import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

/**
 * GET /api/database/health
 * Returns a quick connectivity check with latency and db name.
 */
export async function GET() {
  const startedAt = Date.now()
  try {
    const { client, db } = await connectToDatabase()
    // Ping the admin DB to verify the connection is actually usable
    const ping = await client.db("admin").command({ ping: 1 })
    const durationMs = Date.now() - startedAt

    return NextResponse.json(
      {
        status: "ok" as const,
        message: "MongoDB connection healthy",
        database: db.databaseName,
        durationMs,
        ping,
      },
      { status: 200 },
    )
  } catch (error) {
    const durationMs = Date.now() - startedAt
    const message =
      error instanceof Error ? error.message : "Unknown error connecting to MongoDB"
    return NextResponse.json(
      {
        status: "error" as const,
        message,
        durationMs,
      },
      { status: 503 },
    )
  }
}
