import { NextResponse } from "next/server"
import { withApiAuth, type AuthenticatedRequest } from "@/lib/api-middleware"

async function handler(req: AuthenticatedRequest) {
  try {
    // Mock whale transaction data
    const whaleTransactions = [
      {
        id: "whale_001",
        hash: "0x1234567890abcdef1234567890abcdef12345678",
        from: "0xabcd...5678",
        to: "0x1234...abcd",
        amount: "1,250.5",
        token: "BTC",
        usdValue: 53750000,
        exchange: "Binance",
        type: "withdrawal",
        timestamp: new Date().toISOString(),
        impact: "high",
        confidence: 95,
      },
      {
        id: "whale_002",
        hash: "0xfedcba0987654321fedcba0987654321fedcba09",
        from: "0x9876...4321",
        to: "0xfedc...ba09",
        amount: "15,000",
        token: "ETH",
        usdValue: 39750000,
        exchange: "Coinbase",
        type: "deposit",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        impact: "medium",
        confidence: 88,
      },
    ]

    const url = new URL(req.url)
    const token = url.searchParams.get("token")
    const minValue = Number.parseInt(url.searchParams.get("min_value") || "0")
    const limit = Number.parseInt(url.searchParams.get("limit") || "20")

    let filteredTransactions = whaleTransactions

    if (token) {
      filteredTransactions = filteredTransactions.filter((t) => t.token.toLowerCase() === token.toLowerCase())
    }

    if (minValue > 0) {
      filteredTransactions = filteredTransactions.filter((t) => t.usdValue >= minValue)
    }

    filteredTransactions = filteredTransactions.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: filteredTransactions,
      meta: {
        total: filteredTransactions.length,
        timestamp: new Date().toISOString(),
        filters: { token, minValue, limit },
      },
    })
  } catch (error) {
    console.error("Whales API error:", error)
    return NextResponse.json({ error: "Failed to fetch whale transactions" }, { status: 500 })
  }
}

export const GET = withApiAuth(handler, "whales:read")
