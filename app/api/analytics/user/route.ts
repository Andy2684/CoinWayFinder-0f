import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { eq, and, gte, lte, count, sum, avg, desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { signals, bots, botTrades } from "@/lib/db/schema"
import { sql } from "drizzle-orm"

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any
    return decoded.userId
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request)

    if (!userId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    // Default to last 30 days if no date range provided
    const endDate = endDateParam ? new Date(endDateParam) : new Date()
    const startDate = startDateParam ? new Date(startDateParam) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // User's signal analytics
    const signalAnalytics = await db
      .select({
        totalSignals: count(),
        activeSignals: sql`SUM(CASE WHEN ${signals.status} = 'ACTIVE' THEN 1 ELSE 0 END)`,
        completedSignals: sql`SUM(CASE WHEN ${signals.status} = 'COMPLETED' THEN 1 ELSE 0 END)`,
        totalPnL: sum(signals.pnl),
        avgConfidence: avg(signals.confidence),
      })
      .from(signals)
      .where(and(eq(signals.userId, userId), gte(signals.createdAt, startDate), lte(signals.createdAt, endDate)))

    // User's bot analytics
    const botAnalytics = await db
      .select({
        totalBots: count(),
        activeBots: sql`SUM(CASE WHEN ${bots.status} = 'ACTIVE' THEN 1 ELSE 0 END)`,
        totalProfit: sum(bots.profit),
        totalTrades: sum(bots.totalTrades),
        avgWinRate: avg(bots.winRate),
        avgSharpeRatio: avg(bots.sharpeRatio),
      })
      .from(bots)
      .where(and(eq(bots.userId, userId), gte(bots.createdAt, startDate), lte(bots.createdAt, endDate)))

    // User's trading performance by strategy
    const strategyPerformance = await db
      .select({
        strategy: bots.strategy,
        totalProfit: sum(bots.profit),
        totalTrades: sum(bots.totalTrades),
        avgWinRate: avg(bots.winRate),
        botCount: count(),
      })
      .from(bots)
      .where(and(eq(bots.userId, userId), gte(bots.createdAt, startDate), lte(bots.createdAt, endDate)))
      .groupBy(bots.strategy)
      .orderBy(desc(sum(bots.profit)))

    // User's recent trades
    const recentTrades = await db
      .select({
        symbol: botTrades.symbol,
        type: botTrades.type,
        quantity: botTrades.quantity,
        price: botTrades.price,
        pnl: botTrades.pnl,
        executedAt: botTrades.executedAt,
      })
      .from(botTrades)
      .where(
        and(eq(botTrades.userId, userId), gte(botTrades.executedAt, startDate), lte(botTrades.executedAt, endDate)),
      )
      .orderBy(desc(botTrades.executedAt))
      .limit(20)

    return NextResponse.json({
      success: true,
      data: {
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        signals: signalAnalytics[0],
        bots: botAnalytics[0],
        strategyPerformance,
        recentTrades,
      },
    })
  } catch (error) {
    console.error("Error fetching user analytics:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch user analytics" }, { status: 500 })
  }
}
