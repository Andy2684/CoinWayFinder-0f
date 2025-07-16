import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getUserPortfolio, updatePortfolioPosition } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const portfolio = await getUserPortfolio(decoded.userId)

    return NextResponse.json({
      success: true,
      portfolio,
    })
  } catch (error) {
    console.error("Portfolio fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 })
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

    const { symbol, quantity, averagePrice, currentPrice } = await request.json()

    if (!symbol || !quantity || !averagePrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const position = await updatePortfolioPosition(decoded.userId, symbol, {
      quantity: Number.parseFloat(quantity),
      averagePrice: Number.parseFloat(averagePrice),
      currentPrice: currentPrice ? Number.parseFloat(currentPrice) : undefined,
    })

    return NextResponse.json({
      success: true,
      position,
    })
  } catch (error) {
    console.error("Portfolio update error:", error)
    return NextResponse.json({ error: "Failed to update portfolio" }, { status: 500 })
  }
}
