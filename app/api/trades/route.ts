import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user"
    const url = new URL(request.url)
    const botId = url.searchParams.get("botId")
    const limit = Number.parseInt(url.searchParams.get("limit") || "100")

    let trades
    if (botId) {
      trades = await database.getBotTrades(botId, limit)
    } else {
      trades = await database.getUserTrades(userId, limit)
    }

    return NextResponse.json({ success: true, trades })
  } catch (error) {
    console.error("Failed to get trades:", error)
    return NextResponse.json({ success: false, error: "Failed to get trades" }, { status: 500 })
  }
}
