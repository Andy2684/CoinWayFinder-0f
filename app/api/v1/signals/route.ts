import { NextResponse } from "next/server"
import { withAPIAuth, type AuthenticatedRequest } from "@/lib/api-middleware"

async function handler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get("symbol") || "BTC/USDT"
    const timeframe = searchParams.get("timeframe") || "1h"
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "10"), 100)

    // Mock AI signals data - replace with real AI analysis
    const signals = Array.from({ length: limit }, (_, i) => ({
      id: `signal_${Date.now()}_${i}`,
      symbol,
      timeframe,
      signal: Math.random() > 0.5 ? "BUY" : "SELL",
      confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
      price: 45000 + Math.random() * 10000,
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      indicators: {
        rsi: Math.floor(Math.random() * 100),
        macd: (Math.random() - 0.5) * 100,
        bollinger: Math.random() > 0.5 ? "upper" : "lower",
        volume: Math.floor(Math.random() * 1000000),
      },
      targets: {
        entry: 45000 + Math.random() * 1000,
        stopLoss: 44000 + Math.random() * 500,
        takeProfit: 46000 + Math.random() * 2000,
      },
    }))

    return NextResponse.json({
      success: true,
      data: signals,
      meta: {
        symbol,
        timeframe,
        count: signals.length,
        timestamp: new Date().toISOString(),
        subscriptionStatus: req.user?.subscriptionStatus,
      },
    })
  } catch (error) {
    console.error("Signals API error:", error)
    return NextResponse.json({ error: "Failed to fetch signals" }, { status: 500 })
  }
}

export const GET = withAPIAuth(handler, "signals:read")
