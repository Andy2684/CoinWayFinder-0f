import { type NextRequest, NextResponse } from "next/server"

// Mock bot data - in production, this would come from a database
const mockBots = [
  {
    id: "1",
    name: "DCA Bitcoin Bot",
    strategy: "Dollar Cost Averaging",
    status: "active",
    profit: 1250.5,
    profitPercentage: 8.7,
    trades: 24,
    createdAt: "2024-01-15T10:30:00Z",
    exchange: "Binance",
    pair: "BTC/USDT",
    settings: {
      investment: 100,
      frequency: "daily",
      stopLoss: 5,
      takeProfit: 15,
    },
  },
  {
    id: "2",
    name: "ETH Momentum Bot",
    strategy: "Momentum Trading",
    status: "active",
    profit: -150.25,
    profitPercentage: -2.1,
    trades: 12,
    createdAt: "2024-01-20T14:15:00Z",
    exchange: "Coinbase",
    pair: "ETH/USD",
    settings: {
      investment: 500,
      rsiThreshold: 70,
      stopLoss: 3,
      takeProfit: 8,
    },
  },
  {
    id: "3",
    name: "Altcoin Grid Bot",
    strategy: "Grid Trading",
    status: "paused",
    profit: 750.8,
    profitPercentage: 12.5,
    trades: 45,
    createdAt: "2024-01-10T09:45:00Z",
    exchange: "Binance",
    pair: "ADA/USDT",
    settings: {
      investment: 1000,
      gridLevels: 10,
      priceRange: 0.05,
    },
  },
]

export async function GET() {
  try {
    return NextResponse.json({ bots: mockBots })
  } catch (error) {
    console.error("Error fetching bots:", error)
    return NextResponse.json({ error: "Failed to fetch trading bots" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, strategy, exchange, pair, settings } = await request.json()

    // Validate required fields
    if (!name || !strategy || !exchange || !pair) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new bot (in production, save to database)
    const newBot = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      strategy,
      exchange,
      pair,
      settings,
      status: "inactive",
      profit: 0,
      profitPercentage: 0,
      trades: 0,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ bot: newBot }, { status: 201 })
  } catch (error) {
    console.error("Error creating bot:", error)
    return NextResponse.json({ error: "Failed to create trading bot" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status, settings } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Bot ID is required" }, { status: 400 })
    }

    // Update bot (in production, update in database)
    const updatedBot = {
      ...mockBots.find((bot) => bot.id === id),
      status: status || mockBots.find((bot) => bot.id === id)?.status,
      settings: settings || mockBots.find((bot) => bot.id === id)?.settings,
    }

    return NextResponse.json({ bot: updatedBot })
  } catch (error) {
    console.error("Error updating bot:", error)
    return NextResponse.json({ error: "Failed to update trading bot" }, { status: 500 })
  }
}
