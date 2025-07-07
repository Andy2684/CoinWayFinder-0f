import { type NextRequest, NextResponse } from "next/server"
import { aiRiskAnalyzer } from "@/lib/ai-risk-analyzer"
import { database } from "@/lib/database"
import { subscriptionManager } from "@/lib/subscription-manager"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, symbol } = body

    if (!userId || !symbol) {
      return NextResponse.json({ error: "User ID and symbol required" }, { status: 400 })
    }

    // Check if user has access to AI features
    const plan = await subscriptionManager.getUserPlan(userId)
    if (!plan.features.aiRiskAnalysis) {
      return NextResponse.json({ error: "AI analysis not available in your plan" }, { status: 403 })
    }

    // Get market sentiment analysis
    const sentiment = await aiRiskAnalyzer.getMarketSentiment(symbol)

    // Save analysis to database
    await database.saveAIAnalysis({
      userId,
      symbol,
      analysis: {
        sentiment: sentiment.sentiment,
        confidence: sentiment.confidence,
        signals: sentiment.signals,
        recommendations: [],
        riskFactors: [],
      },
      marketData: {
        price: 0, // Would be fetched from exchange
        volume: 0,
        volatility: 0,
        trend: sentiment.sentiment,
      },
    })

    return NextResponse.json({
      success: true,
      sentiment,
    })
  } catch (error) {
    console.error("Market sentiment analysis failed:", error)
    return NextResponse.json({ error: "Market sentiment analysis failed" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const symbol = searchParams.get("symbol")

    if (!userId || !symbol) {
      return NextResponse.json({ error: "User ID and symbol required" }, { status: 400 })
    }

    // Get latest AI analysis for the symbol
    const analysis = await database.getLatestAIAnalysis(userId, symbol)

    if (!analysis) {
      return NextResponse.json({ error: "No analysis found for this symbol" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error("Failed to get market sentiment:", error)
    return NextResponse.json({ error: "Failed to get market sentiment" }, { status: 500 })
  }
}
