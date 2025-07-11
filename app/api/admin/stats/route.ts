import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock admin statistics
    const stats = {
      totalUsers: 1247,
      activeUsers: 892,
      totalBots: 3456,
      activeBots: 2134,
      totalSignals: 15678,
      successfulTrades: 8934,
      totalRevenue: 125000,
      monthlyRevenue: 15000,
      systemHealth: {
        uptime: "99.9%",
        responseTime: "45ms",
        errorRate: "0.1%",
        activeConnections: 234,
      },
      recentActivity: [
        {
          id: "1",
          type: "user_signup",
          message: "New user registered: john.doe@example.com",
          timestamp: "2024-01-20T16:30:00Z",
        },
        {
          id: "2",
          type: "bot_created",
          message: "Trading bot created by user demo@coinwayfinder.com",
          timestamp: "2024-01-20T16:15:00Z",
        },
        {
          id: "3",
          type: "signal_generated",
          message: "New signal generated for BTC/USDT",
          timestamp: "2024-01-20T16:00:00Z",
        },
        {
          id: "4",
          type: "trade_executed",
          message: "Successful trade executed: +$234.56",
          timestamp: "2024-01-20T15:45:00Z",
        },
      ],
      userGrowth: [
        { month: "Jan", users: 1000 },
        { month: "Feb", users: 1050 },
        { month: "Mar", users: 1120 },
        { month: "Apr", users: 1180 },
        { month: "May", users: 1247 },
      ],
      planDistribution: [
        { plan: "Free", count: 623, percentage: 50 },
        { plan: "Pro", count: 374, percentage: 30 },
        { plan: "Enterprise", count: 250, percentage: 20 },
      ],
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Get admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
