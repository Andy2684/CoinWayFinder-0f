import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getTradingBotById, updateTradingBot, deleteTradingBot } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const bot = await getTradingBotById(params.id, decoded.userId)
    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 })
    }

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
        investment: Number.parseFloat(bot.investment || "0"),
        pair: bot.symbol,
        exchange: bot.exchange,
        config: bot.config,
        createdAt: bot.created_at,
        updatedAt: bot.updated_at,
      },
    })
  } catch (error) {
    console.error("Get bot error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const { name, strategy, config, status } = await request.json()

    const bot = await updateTradingBot(params.id, decoded.userId, {
      name,
      strategy,
      config,
      status,
    })

    if (!bot) {
      return NextResponse.json({ error: "Bot not found or unauthorized" }, { status: 404 })
    }

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
        updatedAt: bot.updated_at,
      },
    })
  } catch (error) {
    console.error("Update bot error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const success = await deleteTradingBot(params.id, decoded.userId)
    if (!success) {
      return NextResponse.json({ error: "Bot not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Bot deleted successfully" })
  } catch (error) {
    console.error("Delete bot error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
