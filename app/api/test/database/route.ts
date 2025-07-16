import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    // Test all table existence
    const tables = [
      "users",
      "trading_signals",
      "trading_bots",
      "portfolios",
      "trade_history",
      "news_articles",
      "alerts",
      "risk_settings",
      "exchange_connections",
    ]

    const tableResults = []

    for (const table of tables) {
      try {
        const result = await sql`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_name = ${table}
        `
        tableResults.push({
          table,
          exists: result[0].count > 0,
          status: "ok",
        })
      } catch (error) {
        tableResults.push({
          table,
          exists: false,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Test basic queries
    const testQueries = []

    try {
      await sql`SELECT COUNT(*) FROM users`
      testQueries.push({ query: "users_count", status: "ok" })
    } catch (error) {
      testQueries.push({
        query: "users_count",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      tables: tableResults,
      queries: testQueries,
    })
  } catch (error) {
    console.error("Database test failed:", error)
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
