import { NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { database } from "@/lib/database"

export async function GET() {
  try {
    const user = await AuthService.getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // Get user settings to determine limits
    const userSettings = await database.getUserSettings(user.id)
    if (!userSettings) {
      return NextResponse.json({ success: false, message: "User settings not found" }, { status: 404 })
    }

    // Get user's bots and trades
    const bots = await database.getUserBots(user.id)
    const trades = await database.getUserTrades(user.id, 1000) // Get more trades for monthly count

    // Calculate monthly trades (current month)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyTrades = trades.filter((trade) => trade.timestamp >= startOfMonth)

    // Determine limits based on subscription plan
    const { plan } = userSettings.subscription
    let maxBots = 2
    let maxTrades = 100
    let maxAiAnalysis = 0

    switch (plan) {
      case "basic":
        maxBots = 5
        maxTrades = 1000
        maxAiAnalysis = 50
        break
      case "premium":
        maxBots = 15
        maxTrades = 10000
        maxAiAnalysis = 500
        break
      case "enterprise":
        maxBots = 999
        maxTrades = 999999
        maxAiAnalysis = 9999
        break
    }

    // Get AI analysis usage (mock for now)
    const aiAnalysisUsed = Math.floor(Math.random() * (maxAiAnalysis * 0.3)) // Simulate usage

    const stats = {
      botsCreated: bots.length,
      maxBots,
      tradesExecuted: monthlyTrades.length,
      maxTrades,
      aiAnalysisUsed,
      maxAiAnalysis,
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Usage stats error:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch usage stats" }, { status: 500 })
  }
}
