import { NextResponse } from "next/server"
import { withAPIAuth, type AuthenticatedRequest } from "@/lib/api-middleware"

async function handler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const minAmount = Number.parseFloat(searchParams.get("minAmount") || "1000000")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 100)

    // Mock whale transaction data - replace with real blockchain analysis
    const whaleTransactions = Array.from({ length: limit }, (_, i) => ({
      id: `whale_${Date.now()}_${i}`,
      hash: `0x${Math.random().toString(16).substring(2, 66)}`,
      from: `0x${Math.random().toString(16).substring(2, 42)}`,
      to: `0x${Math.random().toString(16).substring(2, 42)}`,
      amount: minAmount + Math.random() * 10000000,
      token: ["BTC", "ETH", "USDT", "BNB"][Math.floor(Math.random() * 4)],
      exchange: ["Binance", "Coinbase", "Kraken", "Unknown"][Math.floor(Math.random() * 4)],
      type: Math.random() > 0.5 ? "deposit" : "withdrawal",
      timestamp: new Date(Date.now() - i * 300000).toISOString(), // 5 min intervals
      impact: {
        priceChange: (Math.random() - 0.5) * 5, // -2.5% to +2.5%
        volumeSpike: Math.random() * 200 + 50, // 50-250%
      },
    }))

    return NextResponse.json({
      success: true,
      data: whaleTransactions,
      meta: {
        minAmount,
        count: whaleTransactions.length,
        timestamp: new Date().toISOString(),
        subscriptionStatus: req.user?.subscriptionStatus,
      },
    })
  } catch (error) {
    console.error("Whales API error:", error)
    return NextResponse.json({ error: "Failed to fetch whale transactions" }, { status: 500 })
  }
}

export const GET = withAPIAuth(handler, "whales:read")
