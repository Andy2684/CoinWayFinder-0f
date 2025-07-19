import { NextResponse } from "next/server"
import { createTradingSignal } from "@/lib/signals-api"

export async function POST() {
  const signal = await createTradingSignal({
    symbol: "BTC/USD",
    type: "BUY",
    price: 50000,
    targetPrice: 55000,
    stopLoss: 45000,
    confidence: 0.85,
  })

  return NextResponse.json({ success: true, signal })
}
