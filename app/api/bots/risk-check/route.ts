import { type NextRequest, NextResponse } from "next/server"
import { aiRiskAnalyzer } from "@/lib/ai-risk-analyzer"
import { createExchangeClient } from "@/lib/exchange-api-client"
import { database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, botConfig } = body

    if (!userId || !botConfig) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create exchange client for market data
    const exchangeClient = createExchangeClient(botConfig.exchange, {
      apiKey: botConfig.credentials.apiKey,
      secretKey: botConfig.credentials.secretKey,
      passphrase: botConfig.credentials.passphrase,
      sandbox: process.env.NODE_ENV !== "production",
    })

    // Get market data
    const ticker = await exchangeClient.getTicker(botConfig.symbol)
    const historicalData = await exchangeClient.getKlines(botConfig.symbol, "1h", 100)

    // Create temporary bot object for analysis
    const tempBot = {
      userId,
      name: botConfig.name,
      exchange: botConfig.exchange,
      strategy: botConfig.strategy,
      symbol: botConfig.symbol,
      status: "stopped" as const,
      config: botConfig.config,
      credentials: botConfig.credentials,
      stats: {
        totalTrades: 0,
        winningTrades: 0,
        totalProfit: 0,
        totalLoss: 0,
        winRate: 0,
        maxDrawdown: 0,
        createdAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Perform AI risk analysis
    const riskAnalysis = await aiRiskAnalyzer.analyzeBotRisk(tempBot, ticker, historicalData)

    // Save analysis to database if bot exists
    if (botConfig.botId) {
      await database.updateBot(botConfig.botId, userId, {
        riskAnalysis: {
          riskScore: riskAnalysis.riskScore,
          riskLevel: riskAnalysis.riskLevel,
          warnings: riskAnalysis.warnings,
          recommendations: riskAnalysis.recommendations,
          analyzedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      riskAnalysis: {
        ...riskAnalysis,
        marketData: {
          price: ticker.price,
          change24h: ticker.change24h,
          volume: ticker.volume24h,
          volatility: Math.abs(ticker.change24h),
        },
      },
    })
  } catch (error: any) {
    console.error("Risk analysis failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Risk analysis failed",
        riskAnalysis: {
          riskScore: 50,
          riskLevel: "medium",
          warnings: ["⚠️ Risk analysis unavailable - proceed with caution"],
          recommendations: ["💡 Start with smaller position size", "💡 Monitor bot closely"],
          canStart: true,
          requiresConfirmation: true,
        },
      },
      { status: 500 },
    )
  }
}
