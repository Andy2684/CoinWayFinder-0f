import { type NextRequest, NextResponse } from "next/server"

// Mock data for signals
const mockSignals = [
  {
    id: "1",
    symbol: "BTC/USDT",
    type: "BUY",
    strategy: "Trend Following",
    exchange: "Binance",
    timeframe: "4H",
    confidence: 87,
    entryPrice: 43250,
    targetPrice: 45800,
    stopLoss: 41900,
    currentPrice: 44120,
    pnl: 870,
    pnlPercentage: 2.01,
    progress: 34,
    riskLevel: "MEDIUM",
    aiAnalysis:
      "Strong bullish momentum with RSI showing oversold conditions. Volume profile indicates institutional accumulation.",
    createdAt: "2024-01-15T10:30:00Z",
    status: "ACTIVE",
  },
  {
    id: "2",
    symbol: "ETH/USDT",
    type: "SELL",
    strategy: "Mean Reversion",
    exchange: "Bybit",
    timeframe: "1H",
    confidence: 92,
    entryPrice: 2580,
    targetPrice: 2420,
    stopLoss: 2650,
    currentPrice: 2510,
    pnl: 70,
    pnlPercentage: 2.71,
    progress: 44,
    riskLevel: "LOW",
    aiAnalysis: "Overbought conditions on multiple timeframes. Bearish divergence detected on MACD.",
    createdAt: "2024-01-15T09:15:00Z",
    status: "ACTIVE",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get("symbols")?.split(",") || []
    const strategies = searchParams.get("strategies")?.split(",") || []
    const exchanges = searchParams.get("exchanges")?.split(",") || []
    const status = searchParams.get("status")

    let filteredSignals = mockSignals

    // Apply filters
    if (symbols.length > 0) {
      filteredSignals = filteredSignals.filter((signal) => symbols.includes(signal.symbol))
    }

    if (strategies.length > 0) {
      filteredSignals = filteredSignals.filter((signal) => strategies.includes(signal.strategy))
    }

    if (exchanges.length > 0) {
      filteredSignals = filteredSignals.filter((signal) => exchanges.includes(signal.exchange))
    }

    if (status) {
      filteredSignals = filteredSignals.filter((signal) => signal.status === status)
    }

    return NextResponse.json({
      success: true,
      data: filteredSignals,
      total: filteredSignals.length,
    })
  } catch (error) {
    console.error("Error fetching signals:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch signals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["symbol", "type", "strategy", "exchange", "entryPrice", "targetPrice", "stopLoss"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create new signal
    const newSignal = {
      id: Date.now().toString(),
      ...body,
      currentPrice: body.entryPrice,
      pnl: 0,
      pnlPercentage: 0,
      progress: 0,
      createdAt: new Date().toISOString(),
      status: "ACTIVE",
    }

    // In a real app, you would save this to a database
    console.log("Creating new signal:", newSignal)

    return NextResponse.json({
      success: true,
      data: newSignal,
      message: "Signal created successfully",
    })
  } catch (error) {
    console.error("Error creating signal:", error)
    return NextResponse.json({ success: false, error: "Failed to create signal" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "Signal ID is required" }, { status: 400 })
    }

    // In a real app, you would update the signal in the database
    console.log("Updating signal:", id, updates)

    return NextResponse.json({
      success: true,
      message: "Signal updated successfully",
    })
  } catch (error) {
    console.error("Error updating signal:", error)
    return NextResponse.json({ success: false, error: "Failed to update signal" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Signal ID is required" }, { status: 400 })
    }

    // In a real app, you would delete the signal from the database
    console.log("Deleting signal:", id)

    return NextResponse.json({
      success: true,
      message: "Signal deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting signal:", error)
    return NextResponse.json({ success: false, error: "Failed to delete signal" }, { status: 500 })
  }
}
