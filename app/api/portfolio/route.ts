import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { updatePortfolioPosition } from "@/lib/portfolio"

const JWT_SECRET = process.env.JWT_SECRET || "default_secret"

export async function POST(request: Request) {
  const body = await request.json()
  const { token, symbol, quantity, averagePrice, currentPrice } = body

  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

  const position = await updatePortfolioPosition({
    userId: decoded.userId,
    symbol,
    quantity: Number.parseFloat(quantity),
    averagePrice: Number.parseFloat(averagePrice),
    currentPrice: currentPrice ? Number.parseFloat(currentPrice) : undefined,
  })

  return NextResponse.json({ success: true, position })
}
