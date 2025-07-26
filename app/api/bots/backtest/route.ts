import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { BacktestEngine } from "@/lib/backtest-engine"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const { strategy, symbol, config, startDate, endDate, initialCapital } = await request.json()

    if (!strategy || !symbol || !startDate || !endDate || !initialCapital) {
      return NextResponse.json(
        { success: false, error: "Strategy, symbol, date range, and initial capital are required" },
        { status: 400 },
      )
    }

    const backtestEngine = new BacktestEngine()
    const results = await backtestEngine.runBacktest({
      strategy,
      symbol,
      config: config || {},
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      initialCapital,
      userId: decoded.userId,
    })

    return NextResponse.json({
      success: true,
      results: {
        totalReturn: results.totalReturn,
        totalReturnPercent: results.totalReturnPercent,
        annualizedReturn: results.annualizedReturn,
        maxDrawdown: results.maxDrawdown,
        sharpeRatio: results.sharpeRatio,
        winRate: results.winRate,
        totalTrades: results.totalTrades,
        avgTradeReturn: results.avgTradeReturn,
        profitFactor: results.profitFactor,
        dailyReturns: results.dailyReturns,
        trades: results.trades,
        equity: results.equity,
        drawdown: results.drawdown,
      },
    })
  } catch (error) {
    console.error("Backtest error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
