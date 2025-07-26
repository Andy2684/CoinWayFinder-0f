import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getBotPerformanceMetrics, getBotTradeHistory } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "7d"
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    // Get performance metrics
    const metrics = await getBotPerformanceMetrics(params.id, decoded.userId, timeframe)

    // Get recent trades
    const trades = await getBotTradeHistory(params.id, decoded.userId, limit)

    if (!metrics) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      performance: {
        totalPnl: Number.parseFloat(metrics.total_pnl || "0"),
        totalTrades: metrics.total_trades || 0,
        winRate: Number.parseFloat(metrics.win_rate || "0"),
        avgProfit: Number.parseFloat(metrics.avg_profit || "0"),
        maxDrawdown: Number.parseFloat(metrics.max_drawdown || "0"),
        sharpeRatio: Number.parseFloat(metrics.sharpe_ratio || "0"),
        profitFactor: Number.parseFloat(metrics.profit_factor || "0"),
        dailyReturns: metrics.daily_returns || [],
        monthlyReturns: metrics.monthly_returns || [],
      },
      trades: trades.map((trade) => ({
        id: trade.id,
        symbol: trade.symbol,
        side: trade.type,
        quantity: Number.parseFloat(trade.quantity),
        price: Number.parseFloat(trade.price),
        pnl: Number.parseFloat(trade.pnl || "0"),
        fee: Number.parseFloat(trade.fee || "0"),
        executedAt: trade.executed_at,
      })),
    })
  } catch (error) {
    console.error("Get bot performance error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
