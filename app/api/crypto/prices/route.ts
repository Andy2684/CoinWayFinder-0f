import { NextResponse } from "next/server"
import { cryptoAPI } from "@/lib/crypto-api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const coins = searchParams.get("coins")?.split(",") || undefined

    const prices = await cryptoAPI.getLivePrices(coins)

    return NextResponse.json({
      success: true,
      data: prices,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Crypto prices API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch crypto prices" }, { status: 500 })
  }
}
