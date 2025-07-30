import { type NextRequest, NextResponse } from "next/server"
import { realTimeScreener, type ScreeningCriteria } from "@/lib/real-time-screener"

export async function POST(request: NextRequest) {
  try {
    const { criteria, screenId } = await request.json()

    if (!criteria || !screenId) {
      return NextResponse.json({ success: false, error: "Missing criteria or screenId" }, { status: 400 })
    }

    // Validate criteria
    const validatedCriteria: ScreeningCriteria = {
      priceChange24h: criteria.priceChange24h,
      volume24h: criteria.volume24h,
      marketCap: criteria.marketCap,
      price: criteria.price,
      rsi: criteria.rsi,
      macd: criteria.macd,
      movingAverage: criteria.movingAverage,
      volatility: criteria.volatility,
      exchanges: criteria.exchanges || ["binance", "bybit"],
      symbols: criteria.symbols,
    }

    // Start screening
    realTimeScreener.startScreening(
      screenId,
      validatedCriteria,
      (results) => {
        // In a real implementation, this would use WebSocket or Server-Sent Events
        console.log(`Screening results for ${screenId}:`, results.length, "matches")
      },
      5000,
    )

    return NextResponse.json({
      success: true,
      message: `Screening started for ${screenId}`,
      criteria: validatedCriteria,
    })
  } catch (error) {
    console.error("Screening API error:", error)
    return NextResponse.json({ success: false, error: "Failed to start screening" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const screenId = searchParams.get("screenId")

    switch (action) {
      case "stats":
        const stats = realTimeScreener.getScreeningStats()
        return NextResponse.json({ success: true, data: stats })

      case "active":
        const activeScreenings = realTimeScreener.getActiveScreenings()
        return NextResponse.json({ success: true, data: activeScreenings })

      case "stop":
        if (!screenId) {
          return NextResponse.json({ success: false, error: "Missing screenId" }, { status: 400 })
        }
        realTimeScreener.stopScreening(screenId)
        return NextResponse.json({
          success: true,
          message: `Screening stopped for ${screenId}`,
        })

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Screening GET API error:", error)
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 })
  }
}
