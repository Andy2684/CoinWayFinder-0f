import { type NextRequest, NextResponse } from "next/server"
import { marketDataManager } from "@/lib/market-data-ingestion"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get("symbols")?.split(",") || ["BTCUSDT"]
    const exchange = searchParams.get("exchange") || "binance"
    const type = searchParams.get("type") || "ticker"

    if (type === "popular-pairs") {
      const popularPairs = await marketDataManager.getPopularPairs(exchange)
      return NextResponse.json({
        success: true,
        data: popularPairs,
        exchange,
        timestamp: Date.now(),
      })
    }

    if (type === "aggregated" && symbols.length === 1) {
      const exchanges = searchParams.get("exchanges")?.split(",") || ["binance", "bybit"]
      const aggregatedData = await marketDataManager.getAggregatedMarketData(symbols[0], exchanges)

      return NextResponse.json({
        success: true,
        data: aggregatedData,
        symbol: symbols[0],
        exchanges,
        timestamp: Date.now(),
      })
    }

    if (type === "best-" && symbols.length === 1) {
      const exchanges = searchParams.get("exchanges")?.split(",") || ["binance", "bybit"]
      const bestPrice = await marketDataManager.getBestPrice(symbols[0], exchanges)

      return NextResponse.json({
        success: true,
        data: bestPrice,
        symbol: symbols[0],
        exchanges,
        timestamp: Date.now(),
      })
    }

    // Default: get market data for symbols from single exchange
    const marketData = await marketDataManager.getMarketData(symbols, exchange)

    return NextResponse.json({
      success: true,
      data: marketData,
      symbols,
      exchange,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Market data API error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch market data",
        timestamp: Date.now(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, symbol, exchange, exchanges } = await request.json()

    switch (action) {
      case "subscribe-ticker":
        // In a real implementation, this would set up WebSocket connections
        // For now, we'll return the current ticker data
        const tickerData = await marketDataManager.getMarketData([symbol], exchange)
        return NextResponse.json({
          success: true,
          message: `Subscribed to ticker updates for ${symbol} on ${exchange}`,
          data: tickerData[0] || null,
        })

      case "get-best-":
        const bestPrice = await marketDataManager.getBestPrice(symbol, exchanges || ["binance", "bybit"])
        return NextResponse.json({
          success: true,
          data: bestPrice,
          symbol,
          exchanges: exchanges || ["binance", "bybit"],
        })

      case "get-aggregated":
        const aggregatedData = await marketDataManager.getAggregatedMarketData(
          symbol,
          exchanges || ["binance", "bybit"],
        )
        return NextResponse.json({
          success: true,
          data: aggregatedData,
          symbol,
          exchanges: exchanges || ["binance", "bybit"],
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("Market data POST API error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process market data request",
      },
      { status: 500 },
    )
  }
}
