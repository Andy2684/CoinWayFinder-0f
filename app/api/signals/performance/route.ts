import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Mock performance data - in production, this would come from your database
const mockPerformanceData = {
  "7d": {
    totalPnL: 1150,
    winRate: 76,
    avgReturn: 8.7,
    bestStreak: 12,
    maxDrawdown: -8.5,
    sharpeRatio: 2.34,
    profitFactor: 1.87,
    riskRewardRatio: 2.8,
    dailyData: [
      { date: "2024-01-04", totalPnL: 420, winRate: 70, signals: 10 },
      { date: "2024-01-05", totalPnL: 380, winRate: 65, signals: 8 },
      { date: "2024-01-06", totalPnL: 520, winRate: 78, signals: 12 },
      { date: "2024-01-07", totalPnL: 680, winRate: 82, signals: 15 },
      { date: "2024-01-08", totalPnL: 750, winRate: 85, signals: 18 },
      { date: "2024-01-09", totalPnL: 920, winRate: 73, signals: 22 },
      { date: "2024-01-10", totalPnL: 1150, winRate: 76, signals: 24 },
    ],
    strategyPerformance: [
      { strategy: "AI Trend Following", signals: 45, winRate: 78, avgReturn: 12.4, totalPnL: 558 },
      { strategy: "Mean Reversion", signals: 32, winRate: 85, avgReturn: 8.7, totalPnL: 278 },
      { strategy: "Breakout Scalping", signals: 28, winRate: 68, avgReturn: 15.2, totalPnL: 426 },
      { strategy: "Grid Trading", signals: 25, winRate: 72, avgReturn: 6.8, totalPnL: 170 },
      { strategy: "DCA Accumulation", signals: 18, winRate: 89, avgReturn: 4.5, totalPnL: 81 },
    ],
    riskDistribution: [
      { name: "Low Risk", value: 45, color: "#10B981" },
      { name: "Medium Risk", value: 35, color: "#F59E0B" },
      { name: "High Risk", value: 20, color: "#EF4444" },
    ],
  },
  "30d": {
    totalPnL: 4250,
    winRate: 74,
    avgReturn: 9.2,
    bestStreak: 18,
    maxDrawdown: -12.3,
    sharpeRatio: 2.18,
    profitFactor: 1.92,
    riskRewardRatio: 2.6,
  },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "7d"

    const performanceData = mockPerformanceData[timeframe as keyof typeof mockPerformanceData]

    if (!performanceData) {
      return NextResponse.json({ error: "Invalid timeframe" }, { status: 400 })
    }

    return NextResponse.json(performanceData)
  } catch (error) {
    console.error("Error fetching signal performance:", error)
    return NextResponse.json({ error: "Failed to fetch performance data" }, { status: 500 })
  }
}
