import { type NextRequest, NextResponse } from "next/server"

// Mock paper trading account data
let mockAccount = {
  id: "paper_1",
  name: "Strategy Testing Account",
  initialBalance: 10000,
  currentBalance: 11250,
  totalPnL: 1250,
  totalPnLPercentage: 12.5,
  totalTrades: 45,
  winningTrades: 28,
  losingTrades: 17,
  winRate: 62.2,
  maxDrawdown: -8.5,
  sharpeRatio: 1.85,
  createdAt: "2024-01-01T00:00:00Z",
  isActive: true,
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockAccount,
    })
  } catch (error) {
    console.error("Error fetching paper trading account:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch account" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case "reset":
        mockAccount = {
          ...mockAccount,
          currentBalance: mockAccount.initialBalance,
          totalPnL: 0,
          totalPnLPercentage: 0,
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          winRate: 0,
          maxDrawdown: 0,
          sharpeRatio: 0,
        }
        break

      case "update":
        mockAccount = { ...mockAccount, ...data }
        break

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: mockAccount,
      message: `Account ${action} successful`,
    })
  } catch (error) {
    console.error("Error updating paper trading account:", error)
    return NextResponse.json({ success: false, error: "Failed to update account" }, { status: 500 })
  }
}
