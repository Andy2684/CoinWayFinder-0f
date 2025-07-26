import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getBotAnalytics, getPortfolioAnalytics } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "30d"
    const botIds = searchParams.get("botIds")?.split(",")

    const analytics = await getBotAnalytics(decoded.userId, {
      timeframe,
      botIds,
    })

    const portfolioAnalytics = await getPortfolioAnalytics(decoded.userId, timeframe)

    return NextResponse.json({
      success: true,
      analytics: {
        totalBots: analytics.totalBots,
        activeBots: analytics.activeBots,
        totalInvestment: Number.parseFloat(analytics.totalInvestment || "0"),
        totalPnl: Number.parseFloat(analytics.totalPnl || "0"),
        totalTrades: analytics.totalTrades,
        avgWinRate: Number.parseFloat(analytics.avgWinRate || "0"),
        bestPerformer: analytics.bestPerformer,
        worstPerformer: analytics.worstPerformer,
        strategyDistribution: analytics.strategyDistribution,
        dailyPnl: analytics.dailyPnl || [],
        monthlyPnl: analytics.monthlyPnl || [],
        riskMetrics: {
          sharpeRatio: Number.parseFloat(analytics.sharpeRatio || "0"),
          maxDrawdown: Number.parseFloat(analytics.maxDrawdown || "0"),
          volatility: Number.parseFloat(analytics.volatility || "0"),
          beta: Number.parseFloat(analytics.beta || "0"),
        },
      },
      portfolio: {
        totalValue: Number.parseFloat(portfolioAnalytics.totalValue || "0"),
        totalPnl: Number.parseFloat(portfolioAnalytics.totalPnl || "0"),
        allocation: portfolioAnalytics.allocation || [],
        performance: portfolioAnalytics.performance || [],
      },
    })
  } catch (error) {
    console.error("Get bot analytics error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
