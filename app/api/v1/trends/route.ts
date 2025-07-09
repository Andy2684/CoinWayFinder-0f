import { NextResponse } from "next/server"
import { withApiAuth, type AuthenticatedRequest } from "@/lib/api-middleware"

async function handler(req: AuthenticatedRequest) {
  try {
    // Mock market trends data
    const trends = [
      {
        id: "trend_001",
        symbol: "BTC",
        name: "Bitcoin",
        price: 43250.5,
        change24h: 2.45,
        changePercent24h: 5.67,
        volume24h: 28500000000,
        marketCap: 847500000000,
        trend: "bullish",
        sentiment: "positive",
        socialScore: 85,
        technicalScore: 78,
        fundamentalScore: 82,
        timestamp: new Date().toISOString(),
      },
      {
        id: "trend_002",
        symbol: "ETH",
        name: "Ethereum",
        price: 2650.8,
        change24h: -45.2,
        changePercent24h: -1.68,
        volume24h: 15200000000,
        marketCap: 318600000000,
        trend: "bearish",
        sentiment: "neutral",
        socialScore: 72,
        technicalScore: 65,
        fundamentalScore: 88,
        timestamp: new Date().toISOString(),
      },
    ]

    const url = new URL(req.url)
    const symbol = url.searchParams.get("symbol")
    const trend = url.searchParams.get("trend")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")

    let filteredTrends = trends

    if (symbol) {
      filteredTrends = filteredTrends.filter((t) => t.symbol.toLowerCase() === symbol.toLowerCase())
    }

    if (trend) {
      filteredTrends = filteredTrends.filter((t) => t.trend === trend)
    }

    filteredTrends = filteredTrends.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: filteredTrends,
      meta: {
        total: filteredTrends.length,
        timestamp: new Date().toISOString(),
        filters: { symbol, trend, limit },
      },
    })
  } catch (error) {
    console.error("Trends API error:", error)
    return NextResponse.json({ error: "Failed to fetch market trends" }, { status: 500 })
  }
}

export const GET = withApiAuth(handler, "trends:read")
