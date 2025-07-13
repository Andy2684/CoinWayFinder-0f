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
    created: "2024-01-15",
    pair: "BTC/USDT",
  },
  {
    id: "2",
    name: "Grid Trading ETH",
    strategy: "Grid",
    status: "paused",
    profit: -2.3,
    trades: 23,
    created: "2024-01-20",
    pair: "ETH/USDT",
  },
  {
    id: "3",
    name: "Momentum Scalper",
    strategy: "Momentum",
    status: "active",
    profit: 8.7,
    trades: 156,
    created: "2024-01-10",
    pair: "SOL/USDT",
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
      created: new Date().toISOString().split("T")[0],
    }

    return NextResponse.json({ bot: newBot }, { status: 201 })
  } catch (error) {
    console.error("Error creating bot:", error)
    return NextResponse.json({ error: "Failed to create bot" }, { status: 500 })
  }
}
