import { NextResponse } from "next/server"
import { withApiAuth, type AuthenticatedRequest } from "@/lib/api-middleware"

async function handler(req: AuthenticatedRequest) {
  try {
    // Mock signals data - replace with real data from your trading engine
    const signals = [
      {
        id: "signal_001",
        pair: "BTC/USDT",
        signal: "LONG",
        confidence: 85,
        timeframe: "15m",
        entry: 43250.5,
        targets: [43800, 44200, 44600],
        stopLoss: 42800,
        timestamp: new Date().toISOString(),
        source: "AI_ANALYSIS",
        indicators: {
          rsi: 65.2,
          macd: "bullish",
          volume: "high",
        },
      },
      {
        id: "signal_002",
        pair: "ETH/USDT",
        signal: "SHORT",
        confidence: 72,
        timeframe: "1h",
        entry: 2650.8,
        targets: [2620, 2590, 2560],
        stopLoss: 2680,
        timestamp: new Date().toISOString(),
        source: "WHALE_ACTIVITY",
        indicators: {
          rsi: 78.5,
          macd: "bearish",
          volume: "medium",
        },
      },
    ]

    // Filter based on query parameters
    const url = new URL(req.url)
    const pair = url.searchParams.get("pair")
    const timeframe = url.searchParams.get("timeframe")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")

    let filteredSignals = signals

    if (pair) {
      filteredSignals = filteredSignals.filter((s) => s.pair.toLowerCase().includes(pair.toLowerCase()))
    }

    if (timeframe) {
      filteredSignals = filteredSignals.filter((s) => s.timeframe === timeframe)
    }

    filteredSignals = filteredSignals.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: filteredSignals,
      meta: {
        total: filteredSignals.length,
        timestamp: new Date().toISOString(),
        plan: req.apiKey?.permissions || [],
      },
    })
  } catch (error) {
    console.error("Signals API error:", error)
    return NextResponse.json({ error: "Failed to fetch signals" }, { status: 500 })
  }
}

export const GET = withApiAuth(handler, "signals:read")
