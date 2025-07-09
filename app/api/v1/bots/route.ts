import { NextResponse } from "next/server"
import { withApiAuth, type AuthenticatedRequest } from "@/lib/api-middleware"
import { database } from "@/lib/database"

async function handleGet(req: AuthenticatedRequest) {
  try {
    const bots = await database.getUserBots(req.userId!)

    // Remove sensitive information
    const sanitizedBots = bots.map((bot) => ({
      id: bot._id?.toString(),
      name: bot.name,
      exchange: bot.exchange,
      strategy: bot.strategy,
      symbol: bot.symbol,
      status: bot.status,
      stats: bot.stats,
      createdAt: bot.createdAt,
      lastExecutedAt: bot.lastExecutedAt,
    }))

    return NextResponse.json({
      success: true,
      data: sanitizedBots,
      meta: {
        total: sanitizedBots.length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Bots GET API error:", error)
    return NextResponse.json({ error: "Failed to fetch bots" }, { status: 500 })
  }
}

async function handlePost(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    const { name, exchange, strategy, symbol, config } = body

    if (!name || !exchange || !strategy || !symbol) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create bot (simplified - you'd want more validation)
    const botData = {
      userId: req.userId!,
      name,
      exchange,
      strategy,
      symbol,
      status: "stopped" as const,
      config: {
        riskLevel: config?.riskLevel || 5,
        lotSize: config?.lotSize || 0.01,
        takeProfit: config?.takeProfit || 2,
        stopLoss: config?.stopLoss || 1,
        investment: config?.investment || 100,
        aiRecommendations: config?.aiRecommendations || false,
        parameters: config?.parameters || {},
      },
      credentials: {
        apiKey: "placeholder", // Would be provided by user
        secretKey: "placeholder",
        encrypted: false,
      },
      stats: {
        totalTrades: 0,
        winningTrades: 0,
        totalProfit: 0,
        totalLoss: 0,
        winRate: 0,
        maxDrawdown: 0,
        createdAt: new Date(),
      },
    }

    const botId = await database.createBot(botData)

    return NextResponse.json({
      success: true,
      data: {
        id: botId,
        message: "Bot created successfully",
      },
    })
  } catch (error) {
    console.error("Bots POST API error:", error)
    return NextResponse.json({ error: "Failed to create bot" }, { status: 500 })
  }
}

export const GET = withApiAuth(handleGet, "bots:read")
export const POST = withApiAuth(handlePost, "bots:create")
