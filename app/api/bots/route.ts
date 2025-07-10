import { type NextRequest, NextResponse } from "next/server"

// Mock database for demo purposes
const mockBots = [
  {
    _id: "bot_001",
    name: "BTC DCA Pro",
    strategy: "dca",
    symbol: "BTC/USDT",
    status: "running",
    config: {
      riskLevel: 30,
      lotSize: 0.001,
      takeProfit: 5,
      stopLoss: 2,
      investment: 1000,
    },
    stats: {
      totalTrades: 45,
      winningTrades: 33,
      totalProfit: 234.56,
      totalLoss: -89.23,
      winRate: 73.3,
      createdAt: "2024-01-01T00:00:00Z",
      lastTradeAt: "2024-01-07T12:30:00Z",
    },
    exchange: "Binance",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-07T14:30:00Z",
  },
  {
    _id: "bot_002",
    name: "ETH Grid Master",
    strategy: "grid",
    symbol: "ETH/USDT",
    status: "paused",
    config: {
      riskLevel: 50,
      lotSize: 0.01,
      takeProfit: 3,
      stopLoss: 1.5,
      investment: 2000,
    },
    stats: {
      totalTrades: 78,
      winningTrades: 52,
      totalProfit: 456.78,
      totalLoss: -123.45,
      winRate: 66.7,
      createdAt: "2024-01-02T00:00:00Z",
      lastTradeAt: "2024-01-07T10:15:00Z",
    },
    exchange: "Bybit",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-07T13:45:00Z",
  },
  {
    _id: "bot_003",
    name: "SOL Scalper",
    strategy: "scalping",
    symbol: "SOL/USDT",
    status: "error",
    config: {
      riskLevel: 70,
      lotSize: 1,
      takeProfit: 1,
      stopLoss: 0.5,
      investment: 500,
    },
    stats: {
      totalTrades: 156,
      winningTrades: 89,
      totalProfit: 123.45,
      totalLoss: -67.89,
      winRate: 57.1,
      createdAt: "2024-01-03T00:00:00Z",
      lastTradeAt: "2024-01-07T09:20:00Z",
    },
    exchange: "OKX",
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-07T11:10:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 401 })
    }

    // Simulate database query delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    return NextResponse.json({
      success: true,
      bots: mockBots,
      total: mockBots.length,
    })
  } catch (error) {
    console.error("Error fetching bots:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch bots" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 401 })
    }

    const body = await request.json()
    const { name, strategy, symbol, config } = body

    // Validate required fields
    if (!name || !strategy || !symbol || !config) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Create new bot
    const newBot = {
      _id: `bot_${Date.now()}`,
      name,
      strategy,
      symbol,
      status: "created",
      config: {
        riskLevel: config.riskLevel || 30,
        lotSize: config.lotSize || 0.001,
        takeProfit: config.takeProfit || 5,
        stopLoss: config.stopLoss || 2,
        investment: config.investment || 1000,
      },
      stats: {
        totalTrades: 0,
        winningTrades: 0,
        totalProfit: 0,
        totalLoss: 0,
        winRate: 0,
        createdAt: new Date().toISOString(),
      },
      exchange: config.exchange || "Binance",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to mock database
    mockBots.push(newBot)

    return NextResponse.json({
      success: true,
      bot: newBot,
      message: "Bot created successfully",
    })
  } catch (error) {
    console.error("Error creating bot:", error)
    return NextResponse.json({ success: false, error: "Failed to create bot" }, { status: 500 })
  }
}
