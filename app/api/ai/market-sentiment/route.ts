import { type NextRequest, NextResponse } from "next/server"
import { aiRiskAnalyzer } from "@/lib/ai-risk-analyzer"
import { database } from "@/lib/database"
import { subscriptionManager } from "@/lib/subscription-manager"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, symbol, timeframe = "1d" } = body

    if (!userId || !symbol) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user has access to AI features
    const hasAccess = await subscriptionManager.checkSubscriptionAccess(userId, "ai_risk_analysis")
    if (!hasAccess) {
      return NextResponse.json({ error: "AI analysis requires premium subscription" }, { status: 403 })
    }

    // Get AI market sentiment analysis
    const sentimentAnalysis = await aiRiskAnalyzer.analyzeMarketSentiment(symbol, timeframe)

    // Save analysis to database
    await database.saveAIAnalysis({
      userId,
      symbol,
      analysis: {
        sentiment: sentimentAnalysis.sentiment,
        confidence: sentimentAnalysis.confidence,
        signals: sentimentAnalysis.signals,
        recommendations: sentimentAnalysis.recommendations,
        riskFactors: [],
      },
      marketData: {
        price: 0, // Would be populated with real market data
        volume: 0,
        volatility: 0,
        trend:
          sentimentAnalysis.sentiment === "bullish"
            ? "up"
            : sentimentAnalysis.sentiment === "bearish"
              ? "down"
              : "sideways",
      },
    })

    return NextResponse.json({
      success: true,
      analysis: sentimentAnalysis,
    })
  } catch (error: any) {
    console.error("Market sentiment analysis failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
