import { NextResponse } from "next/server"
import { withAPIAuth, type AuthenticatedRequest } from "@/lib/api-middleware"

async function handler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const timeframe = searchParams.get("timeframe") || "24h"
    const category = searchParams.get("category") || "all"

    // Mock market trends data - replace with real market analysis
    const trends = {
      market: {
        sentiment: Math.random() > 0.5 ? "bullish" : "bearish",
        fearGreedIndex: Math.floor(Math.random() * 100),
        dominance: {
          btc: 45 + Math.random() * 10,
          eth: 15 + Math.random() * 5,
          others: 40 + Math.random() * 10,
        },
      },
      topMovers: Array.from({ length: 10 }, (_, i) => ({
        symbol: ["BTC", "ETH", "BNB", "ADA", "SOL", "DOT", "LINK", "UNI", "MATIC", "AVAX"][i],
        price: Math.random() * 1000 + 10,
        change24h: (Math.random() - 0.5) * 20, // -10% to +10%
        volume24h: Math.random() * 1000000000,
        marketCap: Math.random() * 100000000000,
      })),
      sectors: [
        { name: "DeFi", change: (Math.random() - 0.5) * 15, volume: Math.random() * 500000000 },
        { name: "NFT", change: (Math.random() - 0.5) * 20, volume: Math.random() * 200000000 },
        { name: "Gaming", change: (Math.random() - 0.5) * 25, volume: Math.random() * 150000000 },
        { name: "Layer 1", change: (Math.random() - 0.5) * 12, volume: Math.random() * 800000000 },
      ],
      news: Array.from({ length: 5 }, (_, i) => ({
        title: `Market News ${i + 1}`,
        summary: "Important market development affecting crypto prices...",
        sentiment: Math.random() > 0.5 ? "positive" : "negative",
        impact: Math.floor(Math.random() * 10) + 1,
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      })),
    }

    return NextResponse.json({
      success: true,
      data: trends,
      meta: {
        timeframe,
        category,
        timestamp: new Date().toISOString(),
        subscriptionStatus: req.user?.subscriptionStatus,
      },
    })
  } catch (error) {
    console.error("Trends API error:", error)
    return NextResponse.json({ error: "Failed to fetch market trends" }, { status: 500 })
  }
}

export const GET = withAPIAuth(handler, "trends:read")
