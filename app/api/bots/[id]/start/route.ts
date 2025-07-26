import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { updateBotStatus, getTradingBotById } from "@/lib/database"
import { BotExecutionEngine } from "@/lib/bot-execution-engine"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    // Get bot details
    const bot = await getTradingBotById(params.id, decoded.userId)
    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 })
    }

    // Update bot status to active
    const updatedBot = await updateBotStatus(params.id, "active")
    if (!updatedBot) {
      return NextResponse.json({ error: "Failed to update bot status" }, { status: 500 })
    }

    // Start bot execution
    const executionEngine = BotExecutionEngine.getInstance()
    await executionEngine.startBot(params.id, {
      strategy: bot.strategy,
      config: bot.config,
      userId: decoded.userId,
      symbol: bot.symbol,
      exchange: bot.exchange,
    })

    return NextResponse.json({
      success: true,
      message: "Bot started successfully",
      bot: {
        id: updatedBot.id,
        status: updatedBot.status,
        updatedAt: updatedBot.updated_at,
      },
    })
  } catch (error) {
    console.error("Start bot error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
