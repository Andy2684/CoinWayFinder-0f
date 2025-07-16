import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getTradingBotsByUser, createTradingBot } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const bots = await getTradingBotsByUser(decoded.userId)

    return NextResponse.json({
      success: true,
      bots: bots.map((bot) => ({
        id: bot.id,
        name: bot.name,
        strategy: bot.strategy,
        status: bot.status,
        pnl: Number.parseFloat(bot.pnl || "0"),
        trades: bot.trades_count,
        winRate: Number.parseFloat(bot.win_rate || "0"),
        createdAt: bot.created_at,
      })),
    })
  } catch (error) {
    console.error("Get bots error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const { name, strategy } = await request.json()

    if (!name || !strategy) {
      return NextResponse.json({ success: false, error: "Name and strategy are required" }, { status: 400 })
    }

    const bot = await createTradingBot({
      name,
      strategy,
      userId: decoded.userId,
    })

    return NextResponse.json({
      success: true,
      bot: {
        id: bot.id,
        name: bot.name,
        strategy: bot.strategy,
        status: bot.status,
        pnl: Number.parseFloat(bot.pnl || "0"),
        trades: bot.trades_count,
        winRate: Number.parseFloat(bot.win_rate || "0"),
        createdAt: bot.created_at,
      },
    })
  } catch (error) {
    console.error("Create bot error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
