import { type NextRequest, NextResponse } from "next/server"
import { cryptoAPI } from "@/lib/crypto-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const minValue = Number.parseInt(searchParams.get("min_value") || "1000000")

    const whaleTransactions = await cryptoAPI.getWhaleTransactions(minValue)

    return NextResponse.json({
      success: true,
      data: whaleTransactions,
      count: whaleTransactions.length,
      timestamp: new Date().toISOString(),
      source: "Whale Alert API",
    })
  } catch (error) {
    console.error("Whale transactions API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch whale transactions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
