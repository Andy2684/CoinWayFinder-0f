import { type NextRequest, NextResponse } from "next/server"

// Mock bot data
const mockBots = [
  {
    id: "1",
    name: "DCA Bitcoin Bot",
    strategy: "DCA",
    status: "active",
    profit: 12.5,
    trades: 45,
    created: new Date().toISOString(),
    config: {
      symbol: "BTC/USDT",
      amount: 100,
      interval: "1h",
    },
  },
  {
    id: "2",
    name: "Grid Trading ETH",
    strategy: "Grid",
    status: "paused",
    profit: -2.3,
    trades: 23,
    created: new Date().toISOString(),
    config: {
      symbol: "ETH/USDT",
      gridSize: 0.5,
      amount: 500,
    },
  },
]

export async function GET() {
  try {
    return NextResponse.json({ bots: mockBots })
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
      created: new Date().toISOString(),
    }

    mockBots.push(newBot)

    return NextResponse.json({ bot: newBot }, { status: 201 })
  } catch (error) {
    console.error("Error creating bot:", error)
    return NextResponse.json({ error: "Failed to create bot" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json()

    const botIndex = mockBots.findIndex((bot) => bot.id === id)
    if (botIndex === -1) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 })
    }

    mockBots[botIndex] = { ...mockBots[botIndex], ...updates }

    return NextResponse.json({ bot: mockBots[botIndex] })
  } catch (error) {
    console.error("Error updating bot:", error)
    return NextResponse.json({ error: "Failed to update bot" }, { status: 500 })
  }
}
