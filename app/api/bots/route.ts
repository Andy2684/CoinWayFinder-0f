import { type NextRequest, NextResponse } from "next/server"

// Mock bot data
const mockBots = [
  {
    id: "1",
    name: "DCA Bitcoin Bot",
    strategy: "DCA",
    status: "active",
    pair: "BTC/USDT",
    profit: 12.5,
    trades: 45,
    created: "2024-01-15",
    settings: {
      amount: 100,
      interval: "1h",
      stopLoss: 5,
      takeProfit: 10,
    },
  },
  {
    id: "2",
    name: "Grid Trading ETH",
    strategy: "Grid",
    status: "paused",
    pair: "ETH/USDT",
    profit: -2.3,
    trades: 23,
    created: "2024-01-20",
    settings: {
      gridSize: 0.5,
      gridCount: 10,
      baseAmount: 500,
    },
  },
  {
    id: "3",
    name: "Momentum Scalper",
    strategy: "Momentum",
    status: "active",
    pair: "SOL/USDT",
    profit: 8.7,
    trades: 67,
    created: "2024-01-25",
    settings: {
      rsiThreshold: 70,
      macdSignal: true,
      volume: 1000,
    },
  },
]

export async function GET() {
  try {
    return NextResponse.json({
      bots: mockBots,
      total: mockBots.length,
      active: mockBots.filter((bot) => bot.status === "active").length,
    })
  } catch (error) {
    console.error("Error fetching bots:", error)
    return NextResponse.json({ error: "Failed to fetch bots" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const botData = await request.json()

    const newBot = {
      id: Date.now().toString(),
      ...botData,
      status: "active",
      profit: 0,
      trades: 0,
      created: new Date().toISOString().split("T")[0],
    }

    mockBots.push(newBot)

    return NextResponse.json(newBot, { status: 201 })
  } catch (error) {
    console.error("Error creating bot:", error)
    return NextResponse.json({ error: "Failed to create bot" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json()

    const botIndex = mockBots.findIndex((bot) => bot.id === id)
    if (botIndex === -1) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 })
    }

    mockBots[botIndex] = { ...mockBots[botIndex], ...updateData }

    return NextResponse.json(mockBots[botIndex])
  } catch (error) {
    console.error("Error updating bot:", error)
    return NextResponse.json({ error: "Failed to update bot" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Bot ID is required" }, { status: 400 })
    }

    const botIndex = mockBots.findIndex((bot) => bot.id === id)
    if (botIndex === -1) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 })
    }

    mockBots.splice(botIndex, 1)

    return NextResponse.json({ message: "Bot deleted successfully" })
  } catch (error) {
    console.error("Error deleting bot:", error)
    return NextResponse.json({ error: "Failed to delete bot" }, { status: 500 })
  }
}
