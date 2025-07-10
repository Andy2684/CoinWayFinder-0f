import { type NextRequest, NextResponse } from "next/server"

// Mock trades data
const mockTrades = [
  {
    id: "trade_001",
    botId: "bot_001",
    symbol: "BTC/USDT",
    side: "buy",
    type: "market",
    amount: 0.001,
    price: 67234.56,
    total: 67.23,
    fee: 0.067,
    status: "filled",
    profit: 12.34,
    timestamp: "2024-01-07T14:30:00Z",
    exchange: "Binance",
  },
  {
    id: "trade_002",
    botId: "bot_002",
    symbol: "ETH/USDT",
    side: "sell",
    type: "limit",
    amount: 0.01,
    price: 3456.78,
    total: 34.57,
    fee: 0.035,
    status: "filled",
    profit: 5.67,
    timestamp: "2024-01-07T13:45:00Z",
    exchange: "Bybit",
  },
  {
    id: "trade_003",
    botId: "bot_001",
    symbol: "BTC/USDT",
    side: "sell",
    type: "market",
    amount: 0.001,
    price: 67456.78,
    total: 67.46,
    fee: 0.067,
    status: "filled",
    profit: 2.23,
    timestamp: "2024-01-07T12:15:00Z",
    exchange: "Binance",
  },
]

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 401 })
    }

    // Simulate pagination
    const paginatedTrades = mockTrades.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      trades: paginatedTrades,
      total: mockTrades.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching trades:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch trades" }, { status: 500 })
  }
}
