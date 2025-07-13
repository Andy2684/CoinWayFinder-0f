import { type NextRequest, NextResponse } from "next/server";

// ✅ ВАЖНО: указывает, что этот API-роут должен быть динамическим
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol") || "BTC";
    const timeframe = searchParams.get("timeframe") || "1h";

    // Mock technical analysis data
    const technicalData = {
      symbol,
      timeframe,
      indicators: {
        rsi: 65.4 + Math.random() * 20 - 10,
        macd: {
          value: 0.0023 + Math.random() * 0.01 - 0.005,
          signal: Math.random() > 0.5 ? "BUY" : "SELL",
        },
        sma20: 43250.5 + Math.random() * 1000 - 500,
        ema12: 43180.2 + Math.random() * 1000 - 500,
        stochastic: 72.1 + Math.random() * 20 - 10,
        bollingerBands: {
          upper: 44000 + Math.random() * 500,
          lower: 42000 + Math.random() * 500,
          position: 0.85,
        },
      },
      priceData: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(
          Date.now() - (23 - i) * 60 * 60 * 1000,
        ).toISOString(),
        price: 43000 + Math.random() * 2000 - 1000,
        volume: Math.random() * 1000000,
        rsi: 30 + Math.random() * 40,
        macd: -0.01 + Math.random() * 0.02,
      })),
      overallSignal:
        Math.random() > 0.6 ? "BUY" : Math.random() > 0.3 ? "SELL" : "NEUTRAL",
    };

    return NextResponse.json(technicalData);
  } catch (error) {
    console.error("Technical analysis API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch technical analysis data" },
      { status: 500 },
    );
  }
}
