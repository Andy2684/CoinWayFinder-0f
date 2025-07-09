import { type NextRequest, NextResponse } from "next/server"
import { cryptoAPI } from "@/lib/crypto-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coins = searchParams.get("coins")?.split(",") || ["bitcoin", "ethereum", "binancecoin", "solana", "cardano"]

    const prices = await cryptoAPI.getLivePrices(coins)

    return NextResponse.json({
      success: true,
      data: prices,
      timestamp: new Date().toISOString(),
      source: "CoinGecko API",
    })
  } catch (error) {
    console.error("Crypto prices API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch crypto prices",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
