import { type NextRequest, NextResponse } from "next/server"

// Mock positions storage
const mockPositions = [
  {
    id: "pos_1",
    symbol: "BTC/USDT",
    side: "LONG",
    entryPrice: 43250,
    currentPrice: 44120,
    quantity: 0.1,
    unrealizedPnL: 87,
    unrealizedPnLPercentage: 2.01,
    entryTime: "2024-01-15T10:30:00Z",
    strategy: "RSI Divergence",
    stopLoss: 41900,
    takeProfit: 45800,
  },
  {
    id: "pos_2",
    symbol: "ETH/USDT",
    side: "SHORT",
    entryPrice: 2580,
    currentPrice: 2510,
    quantity: 2.5,
    unrealizedPnL: 175,
    unrealizedPnLPercentage: 2.71,
    entryTime: "2024-01-15T09:15:00Z",
    strategy: "MACD Crossover",
    stopLoss: 2650,
    takeProfit: 2420,
  },
  {
    id: "pos_3",
    symbol: "SOL/USDT",
    side: "LONG",
    entryPrice: 98.5,
    currentPrice: 96.2,
    quantity: 10,
    unrealizedPnL: -23,
    unrealizedPnLPercentage: -2.33,
    entryTime: "2024-01-15T11:45:00Z",
    strategy: "AI Pattern",
    stopLoss: 95.8,
    takeProfit: 105.2,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")

    let positions = mockPositions

    if (symbol) {
      positions = positions.filter((pos) => pos.symbol === symbol)
    }

    // Simulate price updates
    positions = positions.map((pos) => ({
      ...pos,
      currentPrice: pos.currentPrice + (Math.random() - 0.5) * pos.currentPrice * 0.01,
    }))

    return NextResponse.json({
      success: true,
      data: positions,
      total: positions.length,
    })
  } catch (error) {
    console.error("Error fetching paper trading positions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch positions" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const positionId = searchParams.get("positionId")

    if (!positionId) {
      return NextResponse.json({ success: false, error: "Position ID is required" }, { status: 400 })
    }

    const positionIndex = mockPositions.findIndex((pos) => pos.id === positionId)
    if (positionIndex === -1) {
      return NextResponse.json({ success: false, error: "Position not found" }, { status: 404 })
    }

    const closedPosition = mockPositions.splice(positionIndex, 1)[0]

    return NextResponse.json({
      success: true,
      data: closedPosition,
      message: "Position closed successfully",
    })
  } catch (error) {
    console.error("Error closing paper trading position:", error)
    return NextResponse.json({ success: false, error: "Failed to close position" }, { status: 500 })
  }
}
