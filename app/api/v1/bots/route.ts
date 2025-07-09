import { NextResponse } from "next/server"
import { withAPIAuth, withGracefulExpiration, type AuthenticatedRequest } from "@/lib/api-middleware"
import { getBotManager } from "@/lib/bot-manager"

async function getHandler(req: AuthenticatedRequest) {
  try {
    const botManager = getBotManager(req.user!.userId)
    const bots = await botManager.getAllBots()

    // Filter sensitive information for API response
    const sanitizedBots = bots.map((bot) => ({
      id: bot._id?.toString(),
      name: bot.name,
      strategy: bot.strategy,
      symbol: bot.symbol,
      status: bot.status,
      exchange: bot.exchange,
      config: {
        riskLevel: bot.config.riskLevel,
        lotSize: bot.config.lotSize,
        takeProfit: bot.config.takeProfit,
        stopLoss: bot.config.stopLoss,
        investment: bot.config.investment,
      },
      stats: bot.stats,
      createdAt: bot.createdAt,
      updatedAt: bot.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: sanitizedBots,
      meta: {
        count: sanitizedBots.length,
        timestamp: new Date().toISOString(),
        subscriptionStatus: req.user?.subscriptionStatus,
      },
    })
  } catch (error) {
    console.error("Bots GET API error:", error)
    return NextResponse.json({ error: "Failed to fetch bots" }, { status: 500 })
  }
}

async function postHandler(req: AuthenticatedRequest) {
  try {
    // Check if subscription is active for creating new bots
    if (req.user!.subscriptionStatus !== "active") {
      return NextResponse.json(
        {
          error:
            "Subscription expired. Your existing bots will continue running, but you cannot create new bots until you renew your subscription.",
          subscriptionStatus: req.user!.subscriptionStatus,
          renewUrl: "/subscription",
        },
        { status: 402 },
      )
    }

    const body = await req.json()
    const {
      name,
      exchange,
      strategy,
      symbol,
      apiKey,
      secretKey,
      riskLevel,
      lotSize,
      takeProfit,
      stopLoss,
      dcaInterval,
      investment,
      parameters,
    } = body

    // Validate required fields
    if (!name || !exchange || !strategy || !symbol || !apiKey || !secretKey) {
      return NextResponse.json(
        { error: "Missing required fields: name, exchange, strategy, symbol, apiKey, secretKey" },
        { status: 400 },
      )
    }

    const botManager = getBotManager(req.user!.userId)
    const botId = await botManager.createBot({
      name,
      exchange,
      strategy,
      symbol,
      apiKey,
      secretKey,
      riskLevel: riskLevel || 50,
      lotSize: lotSize || 0.001,
      takeProfit: takeProfit || 5,
      stopLoss: stopLoss || 3,
      dcaInterval: dcaInterval || "1h",
      investment: investment || 100,
      parameters: parameters || {},
    })

    if (!botId) {
      return NextResponse.json(
        { error: "Failed to create bot. Please check your exchange credentials." },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          botId,
          message: "Bot created successfully",
        },
        meta: {
          timestamp: new Date().toISOString(),
          subscriptionStatus: req.user?.subscriptionStatus,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Bots POST API error:", error)
    return NextResponse.json({ error: "Failed to create bot" }, { status: 500 })
  }
}

export const GET = withGracefulExpiration(getHandler)
export const POST = withAPIAuth(postHandler, "bots:create")
