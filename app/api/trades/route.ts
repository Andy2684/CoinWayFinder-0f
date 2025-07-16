import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getTradeHistory, createTradeRecord } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const trades = await getTradeHistory(decoded.userId, limit)

    return NextResponse.json({
      success: true,
      trades,
    })
  } catch (error) {
    console.error("Trade history fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch trade history" }, { status: 500 })
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

    const { symbol, type, quantity, price, exchange, fee, orderId, botId } = await request.json()

    if (!symbol || !type || !quantity || !price || !exchange) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const trade = await createTradeRecord({
      userId: decoded.userId,
      symbol,
      type,
      quantity: Number.parseFloat(quantity),
      price: Number.parseFloat(price),
      exchange,
      fee: fee ? Number.parseFloat(fee) : undefined,
      orderId,
      botId,
    })

    return NextResponse.json({
      success: true,
      trade,
    })
  } catch (error) {
    console.error("Trade creation error:", error)
    return NextResponse.json({ error: "Failed to create trade record" }, { status: 500 })
  }
}
