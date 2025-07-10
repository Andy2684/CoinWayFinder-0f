import { type NextRequest, NextResponse } from "next/server"

// Mock signal data - in production, this would come from your database
const mockSignals = [
  {
    id: "1",
    symbol: "BTC/USDT",
    type: "BUY",
    strategy: "AI Trend Following",
    confidence: 87,
    entryPrice: 43250,
    targetPrice: 45800,
    stopLoss: 41900,
    currentPrice: 44100,
    pnl: 850,
    pnlPercentage: 1.97,
    status: "ACTIVE",
    timeframe: "4H",
    createdAt: "2024-01-10T10:30:00Z",
    description: "Strong bullish momentum detected with RSI oversold recovery",
    aiAnalysis:
      "Technical indicators show strong buy signal with 87% confidence. Volume surge confirms breakout above resistance.",
    riskLevel: "MEDIUM",
    exchange: "Binance",
  },
  // Add more mock signals as needed
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const filter = searchParams.get("filter")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let filteredSignals = [...mockSignals]

    // Apply search filter
    if (search) {
      filteredSignals = filteredSignals.filter(
        (signal) =>
          signal.symbol.toLowerCase().includes(search.toLowerCase()) ||
          signal.strategy.toLowerCase().includes(search.toLowerCase()) ||
          signal.description.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Apply status filter
    if (filter && filter !== "all") {
      filteredSignals = filteredSignals.filter((signal) => {
        switch (filter) {
          case "active":
            return signal.status === "ACTIVE"
          case "completed":
            return signal.status === "COMPLETED"
          case "high-confidence":
            return signal.confidence >= 80
          case "scalping":
            return signal.strategy.toLowerCase().includes("scalping")
          case "swing":
            return signal.timeframe === "4H" || signal.timeframe === "1D"
          default:
            return true
        }
      })
    }

    // Apply pagination
    const paginatedSignals = filteredSignals.slice(offset, offset + limit)

    return NextResponse.json({
      signals: paginatedSignals,
      total: filteredSignals.length,
      hasMore: offset + limit < filteredSignals.length,
    })
  } catch (error) {
    console.error("Error fetching signals:", error)
    return NextResponse.json({ error: "Failed to fetch signals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const signalData = await request.json()

    // Validate required fields
    const requiredFields = ["symbol", "type", "strategy", "entryPrice", "targetPrice", "stopLoss"]
    for (const field of requiredFields) {
      if (!signalData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create new signal (in production, save to database)
    const newSignal = {
      id: Date.now().toString(),
      ...signalData,
      currentPrice: signalData.entryPrice,
      pnl: 0,
      pnlPercentage: 0,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    }

    // In production, you would:
    // 1. Save to database
    // 2. Send notifications to subscribers
    // 3. Trigger any automated trading systems
    // 4. Log the signal creation

    return NextResponse.json(newSignal, { status: 201 })
  } catch (error) {
    console.error("Error creating signal:", error)
    return NextResponse.json({ error: "Failed to create signal" }, { status: 500 })
  }
}
