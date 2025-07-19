import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getTradingSignals, createTradingSignal } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const signals = await getTradingSignals(limit, offset)

    return NextResponse.json({
      success: true,
      signals: signals.map((signal) => ({
        id: signal.id,
        symbol: signal.symbol,
        type: signal.type,
        price: Number.parseFloat(signal.price),
        targetPrice: signal.target_price ? Number.parseFloat(signal.target_price) : null,
        stopLoss: signal.stop_loss ? Number.parseFloat(signal.stop_loss) : null,
        confidence: signal.confidence,
        timeframe: signal.timeframe,
        exchange: signal.exchange,
        status: signal.status,
        analysis: signal.analysis,
        pnl: signal.pnl ? Number.parseFloat(signal.pnl) : null,
        createdAt: signal.created_at,
      })),
    })
  } catch (error) {
    console.error("Get signals error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const { symbol, type, price, targetPrice, stopLoss, confidence, timeframe, exchange, analysis } =
      await request.json()

    if (!symbol || !type || !price || confidence === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const signal = await createTradingSignal({
      symbol,
      type,
      price: Number.parseFloat(price),
      targetPrice: targetPrice ? Number.parseFloat(targetPrice) : undefined,
      stopLoss: stopLoss ? Number.parseFloat(stopLoss) : undefined,
      confidence: Number.parseInt(confidence),
      timeframe,
      exchange,
      analysis,
      createdBy: decoded.userId,
    })

    return NextResponse.json({
      success: true,
      signal: {
        id: signal.id,
        symbol: signal.symbol,
        type: signal.type,
        price: Number.parseFloat(signal.price),
        targetPrice: signal.target_price ? Number.parseFloat(signal.target_price) : null,
        stopLoss: signal.stop_loss ? Number.parseFloat(signal.stop_loss) : null,
        confidence: signal.confidence,
        timeframe: signal.timeframe,
        exchange: signal.exchange,
        status: signal.status,
        analysis: signal.analysis,
        createdAt: signal.created_at,
      },
    })
  } catch (error) {
    console.error("Create signal error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
