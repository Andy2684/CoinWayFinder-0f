import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getTradingBotsByUser } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

type TradingBot = {
  id: string
  name: string
  strategy: string
  isActive: boolean
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const bots: TradingBot[] = await getTradingBotsByUser(decoded.userId)

    return NextResponse.json({
      success: true,
      bots: bots.map((bot) => ({
        id: bot.id,
        name: bot.name,
        strategy: bot.strategy,
        isActive: bot.isActive
      }))
    })
  } catch (error) {
    console.error("Bots fetch error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
