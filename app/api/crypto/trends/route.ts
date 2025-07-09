import { type NextRequest, NextResponse } from "next/server"
import { cryptoAPI } from "@/lib/crypto-api"

export async function GET(request: NextRequest) {
  try {
    const trends = await cryptoAPI.getMarketTrends()
    const trending = await cryptoAPI.getTrendingCoins()

    return NextResponse.json({
      success: true,
      data: {
        ...trends,
        trending_coins: trending,
      },
      timestamp: new Date().toISOString(),
      source: "CoinGecko API",
    })
  } catch (error) {
    console.error("Market trends API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch market trends",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
