import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getUserRiskSettings, updateRiskSettings } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const settings = await getUserRiskSettings(decoded.userId)

    return NextResponse.json({
      success: true,
      settings: settings || {
        max_drawdown: 10,
        position_size_limit: 5,
        daily_loss_limit: 1000,
        max_open_positions: 10,
        stop_loss_enabled: true,
        take_profit_enabled: true,
      },
    })
  } catch (error) {
    console.error("Risk settings fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch risk settings" }, { status: 500 })
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

    const { maxDrawdown, positionSizeLimit, dailyLossLimit, maxOpenPositions, stopLossEnabled, takeProfitEnabled } =
      await request.json()

    const settings = await updateRiskSettings(decoded.userId, {
      maxDrawdown: maxDrawdown ? Number.parseFloat(maxDrawdown) : undefined,
      positionSizeLimit: positionSizeLimit ? Number.parseFloat(positionSizeLimit) : undefined,
      dailyLossLimit: dailyLossLimit ? Number.parseFloat(dailyLossLimit) : undefined,
      maxOpenPositions: maxOpenPositions ? Number.parseInt(maxOpenPositions) : undefined,
      stopLossEnabled,
      takeProfitEnabled,
    })

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error("Risk settings update error:", error)
    return NextResponse.json({ error: "Failed to update risk settings" }, { status: 500 })
  }
}
