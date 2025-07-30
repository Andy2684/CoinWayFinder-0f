import { type NextRequest, NextResponse } from "next/server"
import { realTimeScreener } from "@/lib/real-time-screener"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      minPrice: searchParams.get("minPrice") ? Number.parseFloat(searchParams.get("minPrice")!) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number.parseFloat(searchParams.get("maxPrice")!) : undefined,
      minVolume: searchParams.get("minVolume") ? Number.parseFloat(searchParams.get("minVolume")!) : undefined,
      minMarketCap: searchParams.get("minMarketCap") ? Number.parseFloat(searchParams.get("minMarketCap")!) : undefined,
      maxMarketCap: searchParams.get("maxMarketCap") ? Number.parseFloat(searchParams.get("maxMarketCap")!) : undefined,
      exchanges: searchParams.get("exchanges")?.split(","),
      symbols: searchParams.get("symbols")?.split(","),
      minRSI: searchParams.get("minRSI") ? Number.parseFloat(searchParams.get("minRSI")!) : undefined,
      maxRSI: searchParams.get("maxRSI") ? Number.parseFloat(searchParams.get("maxRSI")!) : undefined,
      minChange: searchParams.get("minChange") ? Number.parseFloat(searchParams.get("minChange")!) : undefined,
      maxChange: searchParams.get("maxChange") ? Number.parseFloat(searchParams.get("maxChange")!) : undefined,
    }

    const results = await realTimeScreener.screen(filters)
    const stats = realTimeScreener.getStats()

    return NextResponse.json({
      success: true,
      data: results,
      stats,
      timestamp: new Date().toISOString(),
      filters: Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined)),
    })
  } catch (error: any) {
    console.error("Screening API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch screening results",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case "start":
        realTimeScreener.start()
        return NextResponse.json({
          success: true,
          message: "Real-time screener started",
        })

      case "stop":
        realTimeScreener.stop()
        return NextResponse.json({
          success: true,
          message: "Real-time screener stopped",
        })

      case "stats":
        const stats = realTimeScreener.getStats()
        return NextResponse.json({
          success: true,
          stats,
        })

      case "symbol":
        const { symbol } = params
        if (!symbol) {
          return NextResponse.json({ success: false, error: "Symbol is required" }, { status: 400 })
        }

        const marketData = realTimeScreener.getMarketData(symbol)
        const indicators = realTimeScreener.getIndicators(symbol)

        return NextResponse.json({
          success: true,
          data: {
            marketData,
            indicators,
            symbol,
          },
        })

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Screening POST API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
