import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const startedAt = Date.now()
    const { client, db } = await connectToDatabase()
    // Ping admin to validate connectivity
    const ping = await client.db("admin").command({ ping: 1 })
    const durationMs = Date.now() - startedAt

    return NextResponse.json(
      {
        status: "ok",
        ping,
        database: db.databaseName,
        durationMs,
        message: "MongoDB connection healthy",
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error connecting to MongoDB"
    return NextResponse.json(
      {
        status: "error",
        message,
      },
      { status: 503 }
    )
  }
}
